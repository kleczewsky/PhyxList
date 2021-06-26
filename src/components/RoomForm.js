import { nanoid } from "nanoid";
import React, { useState } from "react";

export default function RoomForm(props) {
    const [roomKey, setRoomKey] = useState("room-" + nanoid());

    const [submitAvalible, setSubmitAvalible] = useState(true);

    // accept roomkeys in both formats room-|roomkey| or |roomkey|
    function handleChange(e) {
        setSubmitAvalible(false);
        const ident = e.target.value.startsWith("room-")
            ? e.target.value.slice(5)
            : e.target.value;
        if (ident === "") {
            setSubmitAvalible(true);
            setRoomKey("room-" + nanoid());
        } else if (ident.length >= 5) {
            setSubmitAvalible(true);
            setRoomKey("room-" + ident);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (submitAvalible) {
            props.downloadRoomTasks(roomKey);
        }
    }

    return (
        <form className="Form room" onSubmit={handleSubmit}>
            <div className="input-area">
                <label>Klucz pokoju</label>
                <input
                    type="text"
                    maxLength="100"
                    autoComplete="off"
                    title="Klucz pokoju - min 5 znaków"
                    name="roomKey"
                    id="roomKey"
                    onChange={handleChange}
                />

                <button disabled={!submitAvalible} type="submit">
                    Dołącz!
                </button>
            </div>
            <div className="bookmark"></div>
        </form>
    );
}
