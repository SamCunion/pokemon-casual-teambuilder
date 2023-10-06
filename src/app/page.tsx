"use client"
import "bootstrap/dist/css/bootstrap.min.css";
import { ReactElement, useState } from "react";
import GameSelector from "./GameSelector";
import Credits from "./Credits";
import InfoOverlay from "./InfoOverlay";

export default function Page() {
    const [appState, changeAppState] = useState("game-select");
    const [overlayActive, setOverlayActive] = useState(false);

    function gameVersionSelect(selected_game) {
        changeAppState("main");
    }
    
    if (appState === "game-select") {
        return (
            <div id="page">
                <GameSelector resolve={gameVersionSelect} />
                <Credits overlayHandler={setOverlayActive} />
                {overlayActive ? <InfoOverlay type={0} selfActive={setOverlayActive} /> : null}
            </div>
        )   
    }
    else {
        return (
            <div id="page">
                <h1>New State</h1>
                <Credits overlayHandler={setOverlayActive} />
            </div>
        )
    }
}