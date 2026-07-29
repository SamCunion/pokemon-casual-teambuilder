import _ from "lodash";
import App from "./App";

/**
 * Entrypoint for the app
 */
function main() {
    //get game id from url
    const url_params = new URLSearchParams(window.location.search);
    const gameID = url_params.get("game");
    $.getJSON("/database/games.json", (data) => {
        for (let game of data) {
            if (game.id == gameID) {
                const app = new App(game);
                app.Init();
                break;
            }
        }
    })
}

main();