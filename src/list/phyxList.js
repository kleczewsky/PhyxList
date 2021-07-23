import Matter from "matter-js";
import MatterAttractors from "matter-attractors";

Matter.use(MatterAttractors);

const PhyxList = {};

// setup scaling variables

PhyxList.renderScaleX = window.innerWidth / 500;
PhyxList.renderScaleY = window.innerHeight / 500;

PhyxList.scale = Math.min(PhyxList.renderScaleY, PhyxList.renderScaleX);

PhyxList.width = window.innerWidth / PhyxList.scale;
PhyxList.height = window.innerHeight / PhyxList.scale;

/**
 * Initialize the physics engine, the rendering loop and mouse controls
 */
export function initPhysics() {
    PhyxList.domTasks = [];
    PhyxList.bodies = [];
    // create an engine
    PhyxList.engine = Matter.Engine.create({
        positionIterations: 7,
        velocityIterations: 7,
    });

    setupWorld();
    setupMouse();
    setupTasks();
    // debugRenderer();

    PhyxList.runner = Matter.Runner.create();
    Matter.Runner.run(PhyxList.runner, PhyxList.engine);
}

// setup world geometry
function setupWorld() {
    const ground = Matter.Bodies.rectangle(
        PhyxList.width / 2,
        PhyxList.height,
        PhyxList.width,
        60,
        {
            isStatic: true,
            friction: 1,
            collisionFilter: { group: -1, mask: 1 },
        }
    );
    const groundLower = Matter.Bodies.rectangle(
        PhyxList.width / 2,
        PhyxList.height * 3,
        2000,
        240,
        {
            isStatic: true,
            friction: 1,
        }
    );
    const rightWall = Matter.Bodies.rectangle(
        PhyxList.width,
        PhyxList.height / 2,
        60,
        2000,
        {
            isStatic: true,
            friction: 1,
        }
    );
    const leftWall = Matter.Bodies.rectangle(0, PhyxList.height / 2, 60, 2000, {
        isStatic: true,
        friction: 1,
    });

    const completedAttractor = Matter.Bodies.circle(
        PhyxList.width / 2,
        PhyxList.height * 1.5,
        5,
        {
            isStatic: true,
            friction: 1,
            collisionFilter: { group: -1, mask: 1 },
            plugin: {
                attractors: [
                    function (bodyA, bodyB) {
                        if (
                            !Matter.Detector.canCollide(
                                bodyA.collisionFilter,
                                bodyB.collisionFilter
                            )
                        ) {
                            return {
                                x:
                                    (bodyA.position.x - bodyB.position.x) *
                                    0.00001,
                                y:
                                    (bodyA.position.y - bodyB.position.y) *
                                    0.00001,
                            };
                        } else {
                            return null;
                        }
                    },
                ],
            },
        }
    );

    const completedCollider = Matter.Bodies.circle(
        PhyxList.width / 2,
        PhyxList.height * 1.5,
        60,
        {
            isStatic: true,
            friction: 1,
        }
    );

    Matter.Events.on(PhyxList.engine, "afterUpdate", () => {
        let time = PhyxList.engine.timing.timestamp;
        Matter.Body.translate(completedAttractor, {
            x: Math.sin(time * 0.001 + 1.5) * 1,
            y: Math.cos(time * 0.001 + 1.5) * 1,
        });
        Matter.Body.translate(completedCollider, {
            x: Math.sin(time * 0.001 + 1.5) * 4,
            y: 0,
        });
    });

    // add all of the bodies to the world
    Matter.Composite.add(PhyxList.engine.world, [
        ground,
        leftWall,
        rightWall,
        groundLower,
        completedAttractor,
        completedCollider,
    ]);
}

// setup mouse interactivity
function setupMouse() {
    let mouseObj = Matter.Mouse.create(document.querySelector("#root"));

    PhyxList.mouse = mouseObj;

    let scale = Matter.Vector.create(1 / PhyxList.scale, 1 / PhyxList.scale);
    Matter.Mouse.setScale(mouseObj, scale);
    let mouseConstraint = Matter.MouseConstraint.create(PhyxList.engine, {
        mouse: mouseObj,
        constraint: {
            // allow bodies on mouse to rotate
            angularStiffness: 0.1,
            stiffness: 0.01,
            damping: 0.1,
            render: {
                visible: true,
            },
        },
    });

    PhyxList.mouseConstraint = mouseConstraint;

    Matter.Composite.add(PhyxList.engine.world, mouseConstraint);

    document.querySelector("#root").addEventListener("mousedown", (e) => {
        e.button == 2 ? (mouseObj.button = 0) : (mouseObj.button = -1);
    });

    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}

// add all inital tasks as physics bodies and setup a loop for updating dom elements positions
function setupTasks() {
    window.onload = () => {
        refreshTasks();
    };

    // rendering loop, go over each task, and update its position according to its physics body in simulation
    window.requestAnimationFrame(update);
    function update() {
        PhyxList.domTasks.forEach((task) => {
            var bodyDom = task;
            var body = null;

            // find the correct physics body
            PhyxList.bodies.some((PhysBody) => {
                if (PhysBody.id == bodyDom.id) {
                    body = PhysBody;
                    return true;
                }
                return false;
            });

            if (body === null) return;

            // set position styles for the task
            bodyDom.style.transform =
                "translate( " +
                Math.floor(
                    body.position.x * PhyxList.scale - bodyDom.offsetWidth / 2
                ) +
                "px, " +
                Math.floor(
                    body.position.y * PhyxList.scale - bodyDom.offsetHeight / 2
                ) +
                "px )" +
                "rotate( " +
                body.angle.toFixed(3) +
                "rad )";
        });
        window.requestAnimationFrame(update);
    }
}

// render a canvas element with options for debugging
function debugRenderer() {
    // create a renderer
    PhyxList.render = Matter.Render.create({
        element: document.body,
        engine: PhyxList.engine,
        options: {
            showMousePosition: true,
            wireframes: false,
            showDebug: true,
            width: PhyxList.width,
            height: PhyxList.height,
        },
    });

    PhyxList.render.canvas.style.position = "absolute";
    PhyxList.render.canvas.style.top = "0";

    PhyxList.render.mouse = PhyxList.mouse;

    Matter.Render.run(PhyxList.render);
}

/**
 * Removes physics body with given taskid
 *
 * @param {number} taskId
 */
export function removeTask(taskId) {
    let bodyFound = PhyxList.bodies.find((body) => body.id === taskId);
    if (bodyFound) {
        PhyxList.bodies = PhyxList.bodies.filter((body) => body.id !== taskId);
        PhyxList.domTasks = document.querySelectorAll(".Task");
        Matter.Composite.remove(PhyxList.engine.world, bodyFound);
    }
}

/**
 * Updates physics body with given taskid
 *
 * @param {number} taskId
 */
export function updateTask(taskId, isCompleted) {
    let bodyFound = PhyxList.bodies.find((body) => {
        return body.id === taskId;
    });
    if (bodyFound) {
        if (isCompleted) {
            Matter.Body.setAngle(bodyFound, 0);
            Matter.Body.setVertices(bodyFound, PhyxList.completedVerts);
            Matter.Body.setAngularVelocity(bodyFound, 0);

            bodyFound.friction = 0.001;

            Matter.Body.set(bodyFound, {
                collisionFilter: {
                    ...bodyFound.collisionFilter,
                    category: 2,
                },
            });
        } else {
            Matter.Body.setAngle(bodyFound, 0);
            Matter.Body.setVertices(bodyFound, bodyFound.oldVerts);
            Matter.Body.setAngularVelocity(bodyFound, 0);

            bodyFound.friction = 1;

            Matter.Body.set(bodyFound, {
                collisionFilter: {
                    ...bodyFound.collisionFilter,
                    category: 1,
                },
            });
        }
    }
}

/**
 * Adds a physics body implementation of a task
 *
 * @param {object} task
 */
export function addTask(task) {
    // get dom references to all tasks, including new ones
    PhyxList.domTasks = document.querySelectorAll(".Task");

    let body = Matter.Bodies.rectangle(
        PhyxList.width / 2,
        PhyxList.height / 2,
        (PhyxList.width * task.offsetWidth) / window.innerWidth,
        (PhyxList.height * task.offsetHeight) / window.innerHeight
    );

    body.oldVerts = body.vertices.map((vert) => {
        return { x: vert.x, y: vert.y };
    });

    body.friction = 1;
    body.frictionStatic = 1;
    // get react assigned id, store for refrence
    body.id = task.getAttribute("data-id");
    PhyxList.bodies.push(body);

    Matter.Composite.add(PhyxList.engine.world, body);
}
/**
 * Removes all physics bodies, and replaces them with current .Task dom elements
 */
export function refreshTasks() {
    PhyxList.domTasks = document.querySelectorAll(".Task");

    // remove all physics bodies/constraints. Clear the engine to prevent old collision info to interfere
    Matter.Composite.clear(PhyxList.engine.world, true, true);
    Matter.Engine.clear(PhyxList.engine);
    // re-add mouse constaint for control
    Matter.Composite.add(PhyxList.engine.world, PhyxList.mouseConstraint);

    PhyxList.bodies = [];

    let i = 0;

    // for each task found in DOM create a physics body, with same id
    PhyxList.domTasks.forEach((task) => {
        const isCompleted = task.getAttribute("data-isCompleted") === "true";

        const x = PhyxList.width / 2;
        const y = isCompleted ? PhyxList.height : i + PhyxList.height * -2;

        let body = Matter.Bodies.rectangle(
            x,
            y,
            (PhyxList.width * task.offsetWidth) / window.innerWidth,
            (PhyxList.height * task.offsetHeight) / window.innerHeight
        );

        body.oldVerts = body.vertices.map((vert) => {
            return { x: vert.x, y: vert.y };
        });
        body.friction = 1;

        if (isCompleted) {
            body.collisionFilter.category = 2;
            body.frictionAir = 0.05;
            body.force.x += Math.random() * 0.1 - 0.05;
            body.force.y += Math.random() * 0.1 - 0.05;

            body.friction = 0;

            PhyxList.completedVerts = body.vertices.map((vert) => {
                return { x: vert.x, y: vert.y };
            });

            body.density = 0.1;
        }

        body.frictionStatic = 1;
        // get react assigned id, store for refrence
        body.id = task.getAttribute("data-id");
        body.isCompleted = isCompleted;

        i++;

        PhyxList.bodies.push(body);
    });
    Matter.Composite.add(PhyxList.engine.world, PhyxList.bodies);
}
