"use client"

import { useState, ReactElement } from "react";

export default function InfoOverlay({type, selfActive}) {

    let children;
    switch (type) {
        case 0: //credits
            children = (
                <div>
                    <h1>Credits:</h1>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                    </ul>
                </div>
            )
        break;
    }

    function closeButtonClicked(e) {
        selfActive(false);
    }

    return (
        <div id="info-overlay" onClick={closeButtonClicked}>
            <div id="info-overlay-content" onClick={e => e.stopPropagation()}>
                {children}
                <button onClick={closeButtonClicked}>Close</button>
            </div>
        </div>
    )
}