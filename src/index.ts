import _ from "lodash";
import App from "./App";

/**
 * Entrypoint for the app
 */
function main() {
    //get game id from url
    const url_params = new URLSearchParams(window.location.search);
    const gameID = url_params.get("game");
    $.getJSON("/pokemon-teambuilder/database/games/" + gameID, (data) => {
        const app = new App(data);
        app.Init();
    })
}

main();