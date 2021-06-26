import React, { useState } from "react";

export default function TaskForm(props) {
    const [task, setTask] = useState({
        name: "",
        description: "",
    });

    function handleChange(e) {
        let value = e.target.value;
        let key = e.target.name;
        setTask((pervState) => {
            return { ...pervState, [key]: value };
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        props.addTask(task);
        setTask({
            name: "",
            description: "",
        });
    }

    return (
        <form className="Form" onSubmit={handleSubmit}>
            <div className="input-area">
                <label>Nazwa zadania</label>
                <input
                    required={true}
                    type="text"
                    maxLength="100"
                    autoComplete="off"
                    name="name"
                    id="name"
                    onChange={handleChange}
                    value={task.name}
                />
                <label>Opis zadania</label>
                <input
                    type="text"
                    maxLength="600"
                    autoComplete="off"
                    name="description"
                    id="description"
                    onChange={handleChange}
                    value={task.description}
                />
                <button type="submit">Dodaj zadanie !</button>
            </div>
            <div className="bookmark"></div>
        </form>
    );
}
