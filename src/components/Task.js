import React, { useState } from "react";

import { ReactComponent as CheckMark } from "../svgs/checkMark.svg";
import { ReactComponent as CloseSvg } from "../svgs/close.svg";

export default function Task(props) {
    const classNames = props.isCompleted ? "Task completed" : "Task";

    const [randomColor, setRandomColor] = useState(() => {
        let hue = Math.floor(Math.random() * (36 - 0 + 1)) * 10;
        return `hsl(${hue}, 62%, 50%)`;
    });

    return (
        <div
            id={props.id}
            data-id={props.id}
            data-iscompleted={props.isCompleted}
            className={classNames}
        >
            <div
                className="closeContainer"
                onClick={() => props.deleteTask(props.id)}
            >
                <CloseSvg />
            </div>

            <div className="checkContainer" style={{ background: randomColor }}>
                <div
                    className="checkBox"
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            props.updateTask(props.id);
                        }
                    }}
                >
                    <CheckMark />
                </div>
            </div>
            <div className="infoContainer">
                <h2>{props.name}</h2>
                <p>{props.description}</p>
            </div>
        </div>
    );
}
