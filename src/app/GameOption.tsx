"use client"
import { useState } from "react"

export default function GameOption(props) {
    const [hovered, setHovered] = useState(Boolean);

    function click() {
        props.resolve(props.item);
    }

    function mouseIn() {
        setHovered(true);
    }
    function mouseOut() {
        setHovered(false);
    }
    
    return (
        <div className="game-option" onClick={click} onMouseEnter={mouseIn} onMouseLeave={mouseOut} style={{"backgroundColor" : hovered ? "lightgrey" : "white"}} data-gamename={props.item.name}>
            <img src={`/img/game-art/${props.item.img}`} className="mx-auto" />
        </div>
    )
    
}