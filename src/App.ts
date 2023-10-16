import Html from "./Html";
import InfoOverlay from "./InfoOverlay";

import version_pokemon from "./lib/version_pokemon.json";
import pokemon from "./lib/pokemon.json";
import GameSelector from "./GameSelector";
import Team from "./Team";
import Coverage from "./Coverage";

export default class App {

    public static hasInitiated: boolean = false;
    public static current_version = null;
    public static team: Team;
    public static coverage: Coverage;

    public static Init() {

        /**
         * Generate infographic button
         */
        $("#generate-infographic-button").on("click", e => {
            InfoOverlay.setContent(Html.infographic);
            InfoOverlay.Show();
        })

        /**
         * Back button functionality
         */
        $("#back-button").on("click", e => {
            App.BackToSelect();
        })

        /**
         * Search box functionality
         */
        $("#pokemon-search").on("input", e => {
            let input_value = (e.target as HTMLInputElement).value;
            $(".pokemon-thumb-container").each((i, v) => {
                let item_name = v.dataset["pkmn_name"];
                if (!item_name.includes(input_value)) {
                    $(v).hide();
                    $(v).removeClass("d-flex");
                }
                else {
                    $(v).show();
                    $(v).addClass("d-flex");
                }
            })
        })

        App.hasInitiated = true;
        App.team = new Team();
    }

    public static Show(version) {
        console.log("Loading game:", version);
        if (version !== this.current_version) {
            this.current_version = version;
            this.team = new Team();
        }
        (document.getElementById("pokemon-search") as HTMLInputElement).value = "";
        App.coverage = new Coverage();
        window.location.hash = "#app"
        App.ListPokemon();
    }

    private static ListPokemon() {
        let pokemon_ids_from_game = version_pokemon[App.current_version.id];
        if (App.current_version["use-dex"]) {
            pokemon_ids_from_game = version_pokemon[App.current_version["use-dex"]];
        }

        for (let i = 0; i < pokemon_ids_from_game.length; i++) {
            let pokemon_obj = pokemon[pokemon_ids_from_game[i]];
            if (pokemon_obj) {
                if (App.current_version.form && pokemon_obj.forms) {
                    for (let j = 0; j < pokemon_obj.forms.length; j++) {
                        if (pokemon[pokemon_obj.forms[j]].name.includes(App.current_version.form)) {
                            pokemon_obj = pokemon[pokemon_obj.forms[j]];
                            break;
                        }
                    }
                }
                let div = $(`<div class="pokemon-thumb-container d-flex" data-pkmn_id=${pokemon_obj.id} data-pkmn_name="${pokemon_obj.name}"></div>`);
                let img = $(`<img src="/public/img/pokemon-sprites/gifs/${pokemon_obj.name}.gif" />`);

                let imgW = (img[0] as HTMLImageElement).naturalWidth;
                let imgH = (img[0] as HTMLImageElement).naturalHeight;
                let imgR = imgH / imgW;

                if (1 < imgR) {
                    img.css({ "height": "100%", "width": "initial" });
                }
                else if (i > imgR) {
                    img.css({ "height": "initial", "width": "100%" });
                }
                else {
                    img.css({ "height": "100%", "width": "100%" });
                }

                div.append(img);
                $("#pokemon-list").append(div);
            }

        }

        $(".pokemon-thumb-container").on("click", e => {
            if (App.team.Add(pokemon[e.currentTarget.dataset.pkmn_id])) {
                console.log(`Pokemon added to team:`, pokemon[e.currentTarget.dataset.pkmn_id]);
            }
            else {
                console.log("Pokemon cannot be added to team, as it is full");
            }
        })
    }

    public static BackToSelect() {
        window.location.hash = "#select";
        $(".pokemon-thumb-container").remove();
    }
}