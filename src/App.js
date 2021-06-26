import "./App.css";
import { ReactComponent as ReloadSvg } from "./svgs/reload.svg";
// dependencies
import { useEffect, useState, useRef } from "react";
import {
    initPhysics,
    removeTask as removePhysTask,
    addTask as addPhysTask,
    refreshTasks,
    updateTask as updatePhysTask,
} from "./list/phyxList";
import { nanoid } from "nanoid";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

// components
import Task from "./components/Task";
import TaskForm from "./components/TaskForm";
import RoomForm from "./components/RoomForm";

function App() {
    const taskData = [
        {
            id: nanoid(),
            name: "Witaj w PhyxList!",
            description:
                "PhyxList to lista zadań napędzana silnikiem fizyki matter.js",
            isCompleted: false,
        },
        {
            id: nanoid(),
            name: "Pokoje",
            description:
                "Aby zapisywać swoje zadania możesz dołączyć do unikalnego pokoju, który wygenerujesz, bądź dołączyć do pokoju swoich znajomych :)",
            isCompleted: false,
        },
        {
            id: nanoid(),
            name: "Zadania",
            description:
                "Zadania są odzwierciedlone w silniku fizycznym, a więc, można nimi manipulować!",
            isCompleted: false,
        },
        {
            id: nanoid(),
            name: "Zadania - Instrukcja",
            description:
                "Przytrzymaj prawy przycisk myszy nad zadaniem i przestaw je gdzie uważasz",
            isCompleted: false,
        },
        {
            id: nanoid(),
            name: "Autor",
            description: "APP & API : Eryk Kleczewski ekkleczewski@gmail.com",
            isCompleted: false,
        },
        {
            id: nanoid(),
            name: "Hej :)",
            description: "Miło, że tu zaglądasz",
            isCompleted: true,
        },
    ];

    const [tasks, setTasks] = useState(taskData);
    const [newTask, setNewTask] = useState(null);
    const [roomKey, setRoomKey] = useState(null);

    let isFirstRender = useRef(true);

    useEffect(() => {
        initPhysics();
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const DOMRef = document.getElementById(newTask.id);
        addPhysTask(DOMRef);
    }, [newTask]);

    const taskList = tasks.map((task) => {
        return (
            <Task
                key={task.id}
                id={task.id}
                name={task.name}
                description={task.description}
                isCompleted={task.isCompleted}
                deleteTask={deleteTask}
                updateTask={updateTask}
            />
        );
    });

    function deleteTask(taskId) {
        let deletedTask = null;
        const updatedTasks = tasks.filter((task) => {
            if (taskId != task.id) {
                return true;
            } else {
                deletedTask = task;
                return false;
            }
        });
        if (roomKey != null || roomKey != undefined) {
            axios
                .delete(
                    "http://127.0.0.1:8000/api/room/" +
                        roomKey +
                        "/tasks/" +
                        deletedTask.apiId
                )
                .catch(function (error) {
                    // handle error
                    handleConnectionError(error);
                });
        }

        removePhysTask(taskId);

        setTasks(updatedTasks);
    }

    function addTask(task) {
        let newTask = {
            id: nanoid(),
            name: task.name,
            description: task.description,
            isCompleted: false,
        };

        if (roomKey != null || roomKey != undefined) {
            axios
                .post(
                    "http://127.0.0.1:8000/api/room/" + roomKey + "/tasks",
                    newTask
                )
                .then(function (response) {
                    newTask.apiId = response.data.id;
                })
                .catch(function (error) {
                    // handle error
                    handleConnectionError(error);
                });
        }

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setNewTask(newTask);
    }

    function updateTask(taskId) {
        let updatedTask = null;
        const updatedTasks = tasks.filter((task) => {
            if (taskId == task.id) {
                task.isCompleted = !task.isCompleted;
                updatedTask = task;
            }

            return true;
        });

        updatePhysTask(taskId, updatedTask.isCompleted);

        if (roomKey != null || roomKey != undefined) {
            axios
                .put(
                    "http://127.0.0.1:8000/api/room/" +
                        roomKey +
                        "/tasks/" +
                        updatedTask.apiId +
                        "?isCompleted=" +
                        updatedTask.isCompleted
                )
                .catch(function (error) {
                    // handle error
                    handleConnectionError(error);
                });
        }

        setTasks(updatedTasks);
    }

    function downloadRoomTasks(key) {
        let roomTaskData = [];

        setRoomKey(key);

        axios
            .get("http://127.0.0.1:8000/api/room/" + key + "/tasks")
            .then(function (response) {
                if (response.status === 201) {
                    toast.success("⭐ Stworzono nowy pokoj o kluczu: " + key);
                }
                if (response.status === 200) {
                    toast.success("✔️ Dołączono do pokoju o kluczu: " + key);
                }
                processData(response.data);
            })
            .catch(function (error) {
                // handle error
                handleConnectionError(error);
            });

        function processData(data) {
            roomTaskData = data.map((task) => {
                return {
                    id: nanoid(),
                    apiId: task.id,
                    name: task.title,
                    isCompleted: task.is_completed,
                    description: task.description,
                };
            });
            setTasks(roomTaskData);

            setTimeout(() => {
                refreshTasks();
            }, 100);
        }
    }

    function handleNotification(status) {
        switch (status) {
            case 429:
                toast.error(
                    <p>
                        429 - Zwolnij kowboju. 🤠
                        <br /> Serwery nie rosną na drzewach
                    </p>
                );
                break;

            case 404:
                toast.error(
                    <p>
                        404 - Nie znaleziono. ❌
                        <br /> Dany zasób nie istnieje
                    </p>
                );
                break;

            case 666:
                toast.error(
                    <p>
                        Serwer nie odpowiada. ❌
                        <br /> Bestia zebrała żniwa
                        <br /> Wyślij zgłoszenie do:
                        <br />
                        <a href="mailto:ekkleczewski@gmail.com?subject=PhyxList serwer nie odpowiada">
                            ekkleczewski@gmail.com
                        </a>
                    </p>,
                    {
                        autoClose: false,
                    }
                );
                break;

            default:
                toast.error(
                    <p>
                        {status} - Wystąpił błąd. 😠
                        <br /> Serwer nie jest zadowolony
                    </p>
                );
                break;
        }
    }

    function handleConnectionError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            handleNotification(error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            handleNotification(666);
        }
    }

    return (
        <div className="App">
            <div className="roomKey">{roomKey}</div>
            <ToastContainer hideProgressBar />
            <div className="refresh" onClick={refreshTasks}>
                <ReloadSvg />
            </div>
            <TaskForm addTask={addTask} />
            <RoomForm downloadRoomTasks={downloadRoomTasks} />
            {taskList}
        </div>
    );
}

export default App;
