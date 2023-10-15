import App from "./App";
import games from "./lib/games.json"

export default class GameSelector {
    public static hasInitiated: boolean = false;
    private static game_elements: HTMLElement[] = [];
    public static game_selected;

    public static Init(): void {
        games.games.forEach(g => {
            let elem = $(`<div class="game-option" data-gamename="${g.name}"><img src="public/img/game-art/${g.img}" class="mx-auto" /></div>`);
            $(elem).on("click", e => {
                GameSelector.game_selected = g;
                window.location.hash = "#app"
            })
            $("#game-list").append(elem);
            GameSelector.game_elements.push(elem[0]);
        })


        document.getElementById("game-search").addEventListener("input", ({target}) => {
            GameSelector.game_elements.forEach(elem => {
                if (!elem.dataset.gamename.toLowerCase().includes((target as HTMLInputElement).value.toLowerCase())) {
                    $(elem).hide();
                }
                else {
                    $(elem).show();
                }
            })
        })

        GameSelector.hasInitiated = true;
    }

    public static Show() {
        window.location.hash = "select";
    }
}