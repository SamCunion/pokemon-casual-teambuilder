/**
 * System class for the pokémon teambuilder
 */
import Pokemon, {PokemonData} from "./Pokemon";
import Team from "./Team";
import Infographic from "./Infographic";
import Credits from "./Credits";
import _ from "lodash";

export type Game = {
    id: string,
    name: string,
    img: string,
    use_dex?: string,
    form: string,
    generation: string,
    starters: Array<string>,
}

export default class App {

    private game: Game;
    private legendaries_enabled = false;
    private mythics_enabled = false;
    private pokemon: Array<Pokemon> = [];
    private team: Team;

    constructor(game: Game) {
        this.game = game;
        console.log(game);
    }

    public Init() {
        //get list of pokemon for the game
        $.getJSON("/pokemon-teambuilder/database/pokemon/" + this.game.id, (pkmn_objects: Array<PokemonData>) => {
            //set page title
            $("#page-title").html(this.game.name);

            //create team object
            this.team = new Team(this.game);

            //load the pokemon into the view panel
            for (let po of pkmn_objects) {
                let pokemon_obj = new Pokemon(po);
                let div = $(`<div class="pokemon-thumb-container d-flex ${po.is_legendary ? "legendary" : ""} ${po.is_mythic ? "mythic" : ""}" data-pkmn_id=${po.id} data-pkmn_name="${po.name}"></div>`);
                let img = $(`<img src="/pokemon-teambuilder/public/img/pokemon-sprites/gifs/${po.name}.gif" />`);


                div.append(img);

                $(img).on("load", e => {
                    let imgW = (img[0] as HTMLImageElement).naturalWidth;
                    let imgH = (img[0] as HTMLImageElement).naturalHeight;
                    let imgR = imgH / imgW;

                    if (1 < imgR) {
                        img.css({ "height": "100%", "width": "initial" });
                    }
                    else if (1 > imgR) {
                        img.css({ "height": "initial", "width": "100%" });
                    }
                    else {
                        img.css({ "height": "100%", "width": "100%" });
                    }
                })

                if ((!this.legendaries_enabled && po.is_legendary) || (!this.mythics_enabled && po.is_mythic)) {
                    $(div).removeClass("d-flex").hide();
                }

                $(div).on("click", () => {
                    this.handleListPokemonClick(pokemon_obj);
                })

                $("#pokemon-list").append(div);
                pokemon_obj.setListElem(div.get(0) as HTMLDivElement);
                this.pokemon.push(pokemon_obj);
            }

            //finally, enable the events
            this.BindEvents();
        })
    }

    private BindEvents() {

        //pokemon searchbox
        $("#pokemon-search").on("input", e => {
            let input_value = (e.target as HTMLInputElement).value;
            $(".pokemon-thumb-container").each((i, v) => {
                let item_name = v.dataset["pkmn_name"];
                if (!item_name.includes(input_value)) {
                    $(v).hide();
                    $(v).removeClass("d-flex");
                }
                else {
                    //check they're not disabled by one of the side switches
                    if (!(($(v).hasClass("legendary") && !this.legendaries_enabled) || ($(v).hasClass("mythic") && !this.mythics_enabled))) {
                        $(v).show();
                        $(v).addClass("d-flex");
                    }
                }
            })
        })

        //back button
        $("#back-button").on("click", e => {
            location.href = "/pokemon-teambuilder";
        })

        //route selector butttons
        $(".route-select-button").on("click", (e) => {
            let index = $(e.currentTarget).data()["slot"];
            this.team.activateRouteSelector(Number(index));
        })

        //infographic button
        $("#generate-infographic-button").on("click", e => {
            let infographic = new Infographic(this.team, Number(this.game.generation));
            infographic.Show();
        })

        //credits button
        $("#expand-credits").on("click", e => {
            let creds = new Credits();
            creds.Show();
        })

        //legendary switch
        $("#legendary-switch").on("change", e => {
            if ($(e.target).is(":checked")) {
                $(".legendary").show().addClass("d-flex");
                this.legendaries_enabled = true;
            }
            else {
                $(".legendary").hide().removeClass("d-flex");
                this.legendaries_enabled = false;
            }
        })

        //mythic switch
        $("#mythic-switch").on("change", e => {
            if ($(e.target).is(":checked")) {
                $(".mythic").show().addClass("d-flex");
                this.mythics_enabled = true;
            }
            else {
                $(".mythic").hide().removeClass("d-flex");
                this.mythics_enabled = false;
            }
        })

        /**
         * randomise button functionality
         */
        $("#randomise-button").on("click", e => {
            if ($("#randomise-switch").prop("checked")) { //completely new team
                for (let i = 0; i < 6; i++) {
                    this.team.clearSlot(i);
                }
            }
            //only fill empty spaces
            while (true) {
                let index = this.team.getNextEmptySlot();
                if (index == -1) { //no empty slots left
                    break;
                }
                this.team.setSlot(index, this.getRandomPokemon());
            }
        })

        $("#suggest-button").on("click", e => {
            if ($("#suggest-switch").prop("checked")) { //fill empty spots with suggested pokemon
                while (true) {
                    let slot = this.team.getNextEmptySlot();
                    if (slot > -1) { //empty slot remains
                        if (!this.team.containsStarter() && this.team.numEmptySlots() > 1) { //if a starter doesnt exist on the team, and theres more than one slot left, put in the best starter
                            let starters: Array<Pokemon> = [];
                            _.forEach(this.pokemon, (p) => {
                                if (this.game.starters.includes(p.id.toString())) {
                                    starters.push(p);
                                }
                            })
                            let suggested_pokemon = this.team.getSuggestedPokemon(starters, false, false);
                            this.team.setSlot(slot, suggested_pokemon);
                        }
                        else {
                            let suggested_pokemon = this.team.getSuggestedPokemon(this.pokemon, this.mythics_enabled, this.legendaries_enabled);
                            this.team.setSlot(slot, suggested_pokemon);
                        }
                    }
                    else { //no empty slots left
                        break;
                    }
                }
            }
            else { //suggest one pokemon to fill the next empty spot
                let slot = this.team.getNextEmptySlot();
                if (slot > -1) { //there is an empty slot
                    if (!this.team.containsStarter() && this.team.numEmptySlots() > 1) { //if a starter doesnt exist on the team, and theres more than one slot left, put in the best starter
                        let starters: Array<Pokemon> = [];
                        _.forEach(this.pokemon, (p) => {
                            if (this.game.starters.includes(p.id.toString())) {
                                starters.push(p);
                            }
                        })
                        let suggested_pokemon = this.team.getSuggestedPokemon(starters, false, false);
                        this.team.setSlot(slot, suggested_pokemon);
                    }
                    else {
                        let suggested_pokemon = this.team.getSuggestedPokemon(this.pokemon, this.mythics_enabled, this.legendaries_enabled);
                        this.team.setSlot(slot, suggested_pokemon);
                    }
                }
            }
        })

    }

    /**
     * Click handler for when a pokemon is clicked in the list view
     * @param po the pokemon clicked in the list
     */
    private handleListPokemonClick(po: Pokemon) {
        let slot = this.team.getNextEmptySlot();
        if (slot > -1) {
            this.team.setSlot(slot, po);
        }
    }

    /**
     * Gets a random fully-evolved pokemon from the game, excluding those already present in the team
     * @returns a random Pokemon
     */
    private getRandomPokemon(): Pokemon {
        let random_pokemon = _.sample(this.pokemon);
        if ((!this.mythics_enabled && random_pokemon.is_mythic) || (!this.legendaries_enabled && random_pokemon.is_legendary) || this.team.includes(random_pokemon)) {
            return this.getRandomPokemon();
        }
        return random_pokemon;
    }

}