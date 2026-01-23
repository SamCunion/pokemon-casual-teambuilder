import { Game } from "./App";
import LocationSelector from "./LocationSelector";
import Pokemon from "./Pokemon";
import _ from "lodash";

type Slot = {
    pokemon: Pokemon;
    location: string;
}

export default class Team {

    private slots: Array<Slot> = [{ pokemon: null, location: "" }, { pokemon: null, location: "" }, { pokemon: null, location: "" }, { pokemon: null, location: "" }, { pokemon: null, location: "" }, { pokemon: null, location: "" }];
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * User has requested the route selector be activated for this party member
     * @param index 0-5 for the index in the party the selector has been activated for
     */
    public activateRouteSelector(index: number) {
        let slot = this.slots[index];
        if (slot.pokemon) {
            let gameID = this.game.id;
            let locations = slot.pokemon.locations[gameID]
            //if use_dex is set, use both games dex instead
            if (this.game.use_dex) {
                gameID = this.game.use_dex;
                locations = _.compact(_.concat(locations, slot.pokemon.locations[this.game.use_dex]));
            }
            let selector = new LocationSelector(locations, slot.location, (newLocation: string|null) => {
                if (newLocation != null) {
                    slot.location = newLocation;
                }
            });
            selector.Show();
        }
    }

    /**
     * Gets the ID of the next empty slot or -1 if none are empty
     */
    public getNextEmptySlot(): number {
        let out = -1;

        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i];
            if (slot.pokemon == null) {
                return i;
            }
        }

        return out;
    }

    /**
     * Clears the pokemon from the given slot
     * @param index the index to clear
     */
    public clearSlot(index: number) {
        //update data structure
        this.slots[index] = {pokemon: null, location: ""};

        //update DOM
        $("#pokemon-sprite-" + index).remove();
        let coverage = this.calculateTeamCoverage()
        this.updateTypeBreakdownView(coverage);
    }

    /**
     * Sets a given slot to a pokemon
     * @param index the index to set
     * @param pokemon the pokemon to set
     */
    public setSlot(index: number, pokemon: Pokemon) {
        //update data structure
        this.slots[index].pokemon = pokemon;
        this.slots[index].location = "";

        //update DOM
        let elem = $(`<img class="pokemon-team-sprite" id="pokemon-sprite-${index}" src="/pokemon-teambuilder/public/img/pokemon-sprites/gifs/${pokemon.name}.gif" />`);
        elem.on("click", e => {
            this.clearSlot(index);
        })
        elem.appendTo(`#team-${index + 1} .pokemon-sprite-container`);
        let coverage = this.calculateTeamCoverage();
        this.updateTypeBreakdownView(coverage);
    }

    /**
     * Checks if a given pokemon type already exists within the team
     * @param pokemon the pokemon to check
     * @returns true if a pokemon of the same species exists in the team, else false
     */
    public includes(pokemon: Pokemon) : boolean {
        for (let slot of this.slots) {
            if (!slot.pokemon) { //empty slot
                continue;
            }
            if (slot.pokemon.id == pokemon.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a list of the pokemon in the slots by index. Index will contain null if there isnt a pokemon assigned to it.
     */
    public getPokemon(): Array<Pokemon> {
        let out = [];
        for (let s of this.slots) {
            out.push(s.pokemon);
        }
        return out;
    }

    /**
     * Returns a list of the locations of the pokemon by index. No location is represented by an empty string.
     */
    public getLocations(): Array<string> {
        let out = [];
        for (let s of this.slots) {
            out.push(s.location);
        }
        return out;
    }

    /**
     * Returns true if the team contains a starter, else false
     */
    public containsStarter() : boolean {
        const starter_ids = this.game.starters;

        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].pokemon && starter_ids.includes(this.slots[i].pokemon.id.toString())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the number of empty slots left in the team
     */
    public numEmptySlots() : number {
        let out = 0;
        for (let i = 0; i < this.slots.length; i++) {
            if (!this.slots[i].pokemon) {
                out++;
            }
        }
        return out;
    }

    public getSuggestedPokemon(pool: Array<Pokemon>, include_mythics?: boolean, include_legendaries?: boolean) : Pokemon {

        const TYPE_BIAS = 150; //the amount a needed type counts towards the pokemons BST

        const coverage = this.calculateTeamCoverage();
        let type_priority = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const off_threats = coverage.offence;
        const def_threats = coverage.defence;
        for (let i = 1; i < type_priority.length; i++) {
            if (off_threats[i] === 0) {
                type_priority[i]++;
            }
            if (def_threats[i] === 0) {
                type_priority[i]++;
            }
        }

        let acceptable_pokemon = [];
        for (let i = 0; i < pool.length; i++) {
            let pokemon = pool[i];
            //filters out: if pokemon already included in team, if legendaries are disabled and is legendary, if mythics are disabled and is mythic, if is a starter and team already contains a starter
            if (!(this.includes(pokemon) || (pokemon.is_legendary && !include_legendaries) || (pokemon.is_mythic && !include_mythics) || (this.containsStarter() && this.game.starters.includes(pokemon.id.toString())))) {
                /**
                 * Look at each type of the pokemon
                 * for each type, take its offensive and defencive effacacy, and check if its required by the type_priority
                 * the above should add to an accumulator, which is in turn multiplied by a bias, and added to the base stat total
                 */
                for (let j = 0; j < pokemon.types.length; j++) {
                    //for each type of the pokemon
                    let pokemon_type = pokemon.types[j];
                    let pokemon_type_id = type_info.types[pokemon_type];

                    for (let k = 1; k < type_info.offence[pokemon_type_id].length; k++) {
                        //if the pokemon's type is effective offensively against a required type, increase the pokemons teammate score
                        if (type_info.offence[pokemon_type_id][k] > 1 && type_priority[k] > 0) {
                            pokemon.teammate_score += (TYPE_BIAS * type_priority[k]);
                        }
                    }
                    for (let k = 1; k < type_info.defence[pokemon_type_id].length; k++) {
                        //if the pokemon's type is effective defencively against a required type, increase the pokemons teammate score
                        if (type_info.defence[pokemon_type_id][k] > 1 && type_priority[k] > 0) {
                            pokemon.teammate_score += (TYPE_BIAS * type_priority[k]);
                        }
                    }

                    //add the pokemon's stat total to its score, stronger pokemon can overcome weak but good type'd pokemon
                    pokemon.teammate_score += pokemon.stat_total;
                }
                acceptable_pokemon.push(pokemon);
            }
        }

        let sorted_pokemon = acceptable_pokemon.sort((a, b) => {
            return b.teammate_score - a.teammate_score;
        });

        if (sorted_pokemon.length > 5) { //if there are more than 5 pokemon in consideration, sample from the best 5
            let suggested_pokemon = sorted_pokemon.slice(0, 5);
            return _.sample(suggested_pokemon);
        }
        //if there are less than 5 pokemon in consideration, pick the best one (probably just the starters)
        return sorted_pokemon[0];
    }

    /**
     * Gets the type effectiveness of the current team regarding offensive and defencive capabilities
     * @param generation the generation (whether fairy type exsits yet or not)
     * @returns Object containing vector of effectiveness for offence and defence
     */
    private calculateTeamCoverage() : Coverage {
        let offence_threats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let defence_threats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].pokemon) {
                let pokemon = this.slots[i].pokemon;
                let types = pokemon.types;
                if (pokemon.past_types && Number(this.game.generation) <= Number(pokemon.past_types.last_generation)) {
                    console.log("updated types used");
                    types = pokemon.past_types.types;
                }
                let type_ids = [];
                let accumulated_effacy_def = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                let accumulated_effacy_off = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                for (let j = 0; j < types.length; j++) {
                    type_ids[j] = type_info["types"][types[j]];
                }

                //for each type, loop through the typechart
                for (let j = 0; j < type_ids.length; j++) {
                    let type = type_ids[j];
                    for (let k = 1; k < 19; k++) {
                        accumulated_effacy_def[k] *= Number(type_info["defence"][type][k]);
                        accumulated_effacy_off[k] += (Number(type_info["offence"][type][k]) > 1) ? 1 : 0;
                    }
                }

                //update totals
                for (let j = 1; j < 19; j++) {
                    let def_val = accumulated_effacy_def[j];
                    let off_val = accumulated_effacy_off[j];
                    if (def_val < 1) { //resists
                        defence_threats[j]++;
                    }
                    if (off_val > 1) {
                        offence_threats[j]++;
                    }
                }
            }
        }
        return {"offence": offence_threats, "defence": defence_threats};
    }

    /**
     * Updates the coverage view according to the coverage object
     * @param coverage coverage of the current team
     */
    private updateTypeBreakdownView(coverage: Coverage) {
        //loop through all types and update the indicator accordingly
        let total = 0;
        for (let i = 1; i < 19; i++) {
            let type_strength = 0;
            if (coverage.offence[i] >= 1) {
                type_strength += .5;
            }
            if (coverage.defence[i] >= 1) {
                type_strength += .5;
            }
            switch (type_strength) {
                case 0:
                    $(`#indicator-${i}`).css("background-color", "#ff5454"); //bad coverage
                    break;
                case 0.5:
                    $(`#indicator-${i}`).css("background-color", "#ffa91f"); //partial coverage
                    break;
                case 1:
                    $(`#indicator-${i}`).css("background-color", "#8aff54"); //good coverage
                    break;
            }
            total += type_strength;

            $(`#t-o-${i}`).html(coverage.offence[i].toString());
            $(`#t-d-${i}`).html(coverage.defence[i].toString());
        }

        if (total < 12) {
            $("#typechart-result").html("Weak"); //overall bad coverage
        }
        else if (total < 16) {
            $("#typechart-result").html("Okay"); //overall moderate coverage
        }
        else {
            $("#typechart-result").html("Strong"); //overall good coverage
        }
    }
}

const type_info : any = {"types":{"normal":"1","fighting":"2","flying":"3","poison":"4","ground":"5","rock":"6","bug":"7","ghost":"8","steel":"9","fire":"10","water":"11","grass":"12","electric":"13","psychic":"14","ice":"15","dragon":"16","dark":"17","fairy":"18"},"offence":{"1":[null,1,1,1,1,1,0.5,1,0,0.5,1,1,1,1,1,1,1,1,1],"2":[null,2,1,0.5,0.5,1,2,0.5,0,2,1,1,1,1,0.5,2,1,2,0.5],"3":[null,1,2,1,1,1,0.5,2,1,0.5,1,1,2,0.5,1,1,1,1,1],"4":[null,1,1,1,0.5,0.5,0.5,1,0.5,0,1,1,2,1,1,1,1,1,2],"5":[null,1,1,0,2,1,2,0.5,1,2,2,1,0.5,2,1,1,1,1,1],"6":[null,1,0.5,2,1,0.5,1,2,1,0.5,2,1,1,1,1,2,1,1,1],"7":[null,1,0.5,0.5,0.5,1,1,1,0.5,0.5,0.5,1,2,1,2,1,1,2,0.5],"8":[null,0,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,0.5,1],"9":[null,1,1,1,1,1,2,1,1,0.5,0.5,0.5,1,0.5,1,2,1,1,2],"10":[null,1,1,1,1,1,0.5,2,1,2,0.5,0.5,2,1,1,2,0.5,1,1],"11":[null,1,1,1,1,2,2,1,1,1,2,0.5,0.5,1,1,1,0.5,1,1],"12":[null,1,1,0.5,0.5,2,2,0.5,1,0.5,0.5,2,0.5,1,1,1,0.5,1,1],"13":[null,1,1,2,1,0,1,1,1,1,1,2,0.5,0.5,1,1,0.5,1,1],"14":[null,1,2,1,2,1,1,1,1,0.5,1,1,1,1,0.5,1,1,0,1],"15":[null,1,1,2,1,2,1,1,1,0.5,0.5,0.5,2,1,1,0.5,2,1,1],"16":[null,1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,2,1,0],"17":[null,1,0.5,1,1,1,1,1,2,1,1,1,1,1,2,1,1,0.5,0.5],"18":[null,1,2,1,0.5,1,1,1,1,0.5,0.5,1,1,1,1,1,2,2,0.1]},"defence":{"1":[null,1,2,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],"2":[null,1,1,2,1,1,0.5,0.5,1,1,1,1,1,1,2,1,1,0.5,2],"3":[null,1,0.5,1,1,0,2,0.5,1,1,1,1,0.5,2,1,2,1,1,1],"4":[null,1,0.5,1,0.5,2,1,0.5,1,1,1,1,0.5,1,2,1,1,1,0.5],"5":[null,1,1,1,0.5,1,0.5,1,1,1,1,2,2,0,1,2,1,1,1],"6":[null,0.5,2,0.5,0.5,2,1,1,1,2,0.5,2,2,1,1,1,1,1,1],"7":[null,1,0.5,2,1,0.5,2,1,1,1,2,1,0.5,1,1,1,1,1,1],"8":[null,0,0,1,0.5,1,1,0.5,2,1,1,1,1,1,1,1,1,2,1],"9":[null,0.5,2,0.5,0,2,0.5,0.5,1,0.5,2,1,0.5,1,0.5,0.5,0.5,1,0.5],"10":[null,1,1,1,1,2,2,0.5,1,0.5,0.5,2,0.5,1,1,0.5,1,1,0.5],"11":[null,1,1,1,1,1,1,1,1,0.5,0.5,0.5,2,2,1,0.5,1,1,1],"12":[null,1,1,2,2,0.5,1,2,1,1,2,0.5,0.5,0.5,1,2,1,1,1],"13":[null,1,1,0.5,1,2,1,1,1,0.5,1,1,1,0.5,1,1,1,1,1],"14":[null,1,0.5,1,1,1,1,2,2,1,1,1,1,1,0.5,1,1,2,1],"15":[null,1,2,1,1,1,2,1,1,2,2,1,1,1,1,0.5,1,1,1],"16":[null,1,1,1,1,1,1,1,1,1,0.5,0.5,0.5,0.5,1,2,2,1,2],"17":[null,1,2,1,1,1,1,2,0.5,1,1,1,1,1,0,1,1,0.5,2],"18":[null,1,0.5,1,2,1,1,0.5,1,2,1,1,1,1,1,1,0,0.5,0.1]}};

type Coverage = {
    "offence": Array<number>;
    "defence": Array<number>;
}