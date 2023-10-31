import Html from "./Html";
import InfoOverlay from "./InfoOverlay";

import version_pokemon from "./lib/version_pokemon.json";
import pokemon from "./lib/pokemon.json";
import Team from "./Team";
import Coverage from "./Coverage";
import Infographic from "./Infographic";
import type_convert from "./lib/types.json";

export default class App {

    public static hasInitiated: boolean = false;
    public static current_version = null;
    public static team: Team;
    public static coverage: Coverage;
    public static legendaryEnabled: boolean = false;
    public static mythicEnabled: boolean = false;

    public static active_pokemon = [];
    public static suggested_pokemon = [];

    private static readonly TYPE_BIAS = 10;

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

        /**
         * Route select buttons functionality
         */
        $(".route-select-button").on("click", e => {
            let slot_id = Number(e.currentTarget.dataset["slot"]);
            let pokemon = App.team.Get(slot_id);
            
            if (!pokemon[0]) {
                return;
            }
            let use_version_locations = App.current_version["use-dex"] ? App.current_version["use-dex"] : App.current_version.id;

            InfoOverlay.setContent(Html.route_select);
            InfoOverlay.Show();

            if (["25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "39", "40", "41"].includes(App.current_version.id)) { //detect if its one of the games with no data
                $("#route-warning-text").html("Warning: Unfortunately, the database I used to determine the in-game location of pokémon didn't have information for the most recent games. If the database is updated, then they will be added. Instead, you can type a location into the input box below which will be added to the final infographic. You can find the locations for pokemon on other websites such as <a target='_blank' rel='noopener noreferrer' href='https://bulbapedia.bulbagarden.net' >Bulbapedia</a>.")
                let container = $(`<div class="input-group justify-content-center w-100 align-items-center d-flex h-100"></div>`);
                let input = $(`<input type="text" placeholder="Location" class="form-control w-50" style="flex: none"/>`);
                let aside = $(`<div class="input-group-append"></div>`);
                let confirm = $(`<button class="btn btn-primary">Confirm</button>`);

                $(confirm).on("click", e => {
                    App.team.SetLocation(slot_id, (input[0] as HTMLInputElement).value);
                    $("#info-overlay-close").click();
                })

                input.appendTo(container);
                confirm.appendTo(aside);
                aside.appendTo(container);
                container.appendTo("#route-select-list-container");

            }
            else if (pokemon[0].locations[use_version_locations]) { //locations found
                let locations = pokemon[0].locations[use_version_locations];
                $(`<div class="list-group h-100" id="route-list"></div>`).appendTo("#route-select-list-container");
                for (let i = 0; i < locations.length; i++) {
                    let location = locations[i];
                    let item = $(`<a class="location-item list-group-item list-group-item-action align-items-center justify-content-between d-flex ${pokemon[1] === location ? "active" : ""}">${location}</a>`);
                    item.on("click", e=> {
                        App.team.SetLocation(slot_id, location);
                        $("#info-overlay-close").click();
                    })
                    item.appendTo("#route-list");
                }
            }
            else {
                $("#route-select-list-container").append(`<h4>No wild encounters found for pokémon in game.</h4>`)
            }
        })

        /**
         * Infographic button functionality
         */
        $("#generate-infographic-button").on("click", e => {
            let infographic = new Infographic(App.team);
            infographic.Show();
        })

        /**
         * Legendary switch functionality
         */
        $("#legendary-switch").on("change", e => {
            if ($(e.target).is(":checked")) {
                $(".legendary").show().addClass("d-flex");
                App.legendaryEnabled = true;
            }
            else {
                $(".legendary").hide().removeClass("d-flex");
                App.legendaryEnabled = false;
            }
        })

        /**
         * Mythic switch functionality
         */
        $("#mythic-switch").on("change", e => {
            if ($(e.target).is(":checked")) {
                $(".mythic").show().addClass("d-flex");
                App.mythicEnabled = true;
            }
            else {
                $(".mythic").hide().removeClass("d-flex");
                App.mythicEnabled = false;
            }
        })

        /**
         * Randomise button functionality
         */
        $("#randomise-button").on("click", e => {
            if ($("#randomise-switch").prop("checked")) {
                App.team = new Team();
            }
            for (let i = 0; i < 7; i++) {
                App.team.Add(App.getRandomPokemon());
            }
        })

        /**
         * Suggest button functionality
         */
        $("#suggest-button").on("click", e => {
            if ($("#suggest-switch").prop("checked")) {
                for (let i = 0; i < 7; i++) {
                    let pkmn = App.getSuggestedPokemon();
                    console.log(`Suggested pokemon "${pkmn.name}" with bias: ${pkmn.bias} and stat total of: ${pkmn.stat_total}`);
                    App.team.Add(pkmn);
                }
            }
            else {
                let pkmn = App.getSuggestedPokemon();
                console.log(`Suggested pokemon "${pkmn.name}" with bias: ${pkmn.bias} and stat total of: ${pkmn.stat_total}`);
                App.team.Add(pkmn);
            }
            App.updateSuggestionArray(App.active_pokemon, App.coverage.getCoverage());
        })

        App.hasInitiated = true;
        App.team = new Team();
    }

    public static Show(version) {
        console.log("Loading game:", version);
        if (version !== this.current_version) {
            App.current_version = version;
            App.team = new Team();
            App.active_pokemon = [];
            App.suggested_pokemon = [];
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
                App.active_pokemon.push(pokemon_obj);
                let div = $(`<div class="pokemon-thumb-container d-flex ${pokemon_obj.is_legendary ? "legendary" : ""} ${pokemon_obj.is_mythic ? "mythic" : ""}" data-pkmn_id=${pokemon_obj.id} data-pkmn_name="${pokemon_obj.name}"></div>`);
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

                if ((!App.legendaryEnabled && pokemon_obj.is_legendary) || (!App.mythicEnabled && pokemon_obj.is_mythic)) {
                    $(div).removeClass("d-flex").hide();
                }
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

    private static getRandomPokemon() {
        let random_index = Math.floor(Math.random() * App.active_pokemon.length);
        let random_pokemon = App.active_pokemon[random_index];
        if ((!App.mythicEnabled && random_pokemon.is_mythic) || (!App.legendaryEnabled && random_pokemon.is_legendary) || App.team.includes(random_pokemon)) {
            return App.getRandomPokemon();
        }
        return random_pokemon;
    }

    public static updateSuggestionArray(availablePokemon, typeInfo) {
        /**
         * Loop through all types, determine rank of each type as 0,1,2 depending on if there is a off/def satisfactory or not
         * Sort the types depending on this value
         * 
         * Loop through all active pokemon and rank by total power
         * Add together total power and type rank * 100?
         * Use the most wanted type for this calculation if pokemon has more than 1
         * 
         * Sort each pokemon by their overall bias value.
         * 
         * Retain the first 5? highest scoring pokemon.
         * 
         * Process needs to be run every time the team changes.
         * 
         */
        let type_priority = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let off_threats = typeInfo[0];
        let def_threats = typeInfo[1];
        for (let i = 1; i < type_priority.length; i++) {
            if (off_threats[i] === 0) {
                type_priority[i]++;
            }
            if (def_threats[i] === 0) {
                type_priority[i]++;
            }
        }

        for (let i = 0; i < availablePokemon.length; i++) {
            let pokemon = availablePokemon[i];
            pokemon.bias = 0;
            if (!App.team.includes(pokemon) && !(pokemon.is_legendary && !App.legendaryEnabled) && !(pokemon.is_mythic && !App.mythicEnabled)) {
                /**
                 * Look at each type of the pokemon
                 * for each type, take its offensive and defencive effacacy, and check if its required by the type_priority
                 * the above should add to an accumulator, which is in turn multiplied by a bias, and added to the base stat total
                 */
                for (let j = 0; j < pokemon.types.length; j++) {
                    let pokemon_type = pokemon.types[j];
                    let pokemon_type_id = type_convert.types[pokemon_type];
                    for (let k = 1; k < type_convert.offence[pokemon_type_id].length; k++) {
                        if (type_convert.offence[pokemon_type_id][k] > 1 && type_priority[k] > 0) {
                            pokemon.bias += (App.TYPE_BIAS * type_priority[k]);
                        }
                    }
                    for (let k = 1; k < type_convert.defence[pokemon_type_id].length; k++) {
                        if (type_convert.defence[pokemon_type_id][k] > 1 && type_priority[k] > 0) {
                            pokemon.bias += (App.TYPE_BIAS * type_priority[k]);
                        }
                    }
                    pokemon.bias += pokemon.stat_total;
                }
            }
        }

        let sorted_pokemon = [...availablePokemon].sort((a, b) => {
            return b.bias - a.bias;
        });
        App.suggested_pokemon = sorted_pokemon.slice(0, 5);
    }

    public static getSuggestedPokemon() {
        App.updateSuggestionArray(App.active_pokemon, App.coverage.getCoverage());
        let current_team_member_count = 0;
        for (let i = 0; i < App.team.GetAll().length; i++) {
            if (App.team.GetAll()[i][0]) {
                current_team_member_count++;
            }
        }
        if (current_team_member_count < 5) {
            let starter_pokemon_objs = [];
            for (let i = 0; i < App.current_version.starters.length; i++) {
                starter_pokemon_objs.push(pokemon[App.current_version.starters[i]]);
            }
            let team_includes_starter = false;
            for (let i = 0; i < starter_pokemon_objs.length; i++) {
                if (App.team.includes(starter_pokemon_objs[i])) {
                    team_includes_starter = true;
                    break;
                }
            }
            if (!team_includes_starter) {
                return starter_pokemon_objs[Math.floor(Math.random() * starter_pokemon_objs.length)];
            }
        }
        return App.suggested_pokemon[Math.floor(Math.random() * App.suggested_pokemon.length)];
    }
}