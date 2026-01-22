import Html from "./Html";
import InfoOverlay from "./InfoOverlay";
import Team from "./Team";

export default class Infographic extends InfoOverlay {

    private readonly WIDTH: number = 500;
    private readonly HEIGHT_PER_POKEMON: number = 120;
    private readonly BORDER_HEIGHT: number = 5;

    private team: Team;
    private generation: number;

    constructor(team: Team, generation: number) {
        super();
        this.team = team;
        this.generation = generation;
    }

    public override Show() {
        super.setContent(Html.infographic);
        super.Show();
        this.Populate(($("#infographic-canvas")[0] as HTMLCanvasElement));
    }

    private Populate(canvas: HTMLCanvasElement) {
        //get pokemon and locations
        const pokemon = this.team.getPokemon();
        const locations = this.team.getLocations();
        //set dimensions
        let ctx = canvas.getContext("2d");
        let total_pokemon = 0;
        let last_pokemon_index = 0;
        for (let i = 0; i < pokemon.length; i++) {
            if (pokemon[i]) {
                total_pokemon++;
                last_pokemon_index = i;
            }
        }
        canvas.height = (total_pokemon * (this.HEIGHT_PER_POKEMON + this.BORDER_HEIGHT));
        canvas.width = this.WIDTH;

        //pokeball sprite
        let pokeball = document.getElementsByClassName("pokeball-sprite")[0];

        //draw for each
        let starting_y = 0;
        for (let i = 0; i < pokemon.length; i++) {
            let current_pokemon = pokemon[i];
            if (current_pokemon) {
                let pokemon_types = current_pokemon.types;
                if (current_pokemon.past_types && this.generation <= Number(current_pokemon.past_types.last_generation)) {
                    pokemon_types = current_pokemon.past_types.types;
                }
                let location = locations[i];
                let name = current_pokemon.name[0].toUpperCase() + current_pokemon.name.substring(1, current_pokemon.name.length);
                let sprite = document.getElementById(`pokemon-sprite-${i}`) as HTMLImageElement;
                //background
                ctx.fillStyle = type_colours[pokemon_types[0]];
                ctx.fillRect(0, starting_y, this.WIDTH, this.HEIGHT_PER_POKEMON);

                //pokeball
                ctx.drawImage((pokeball as HTMLImageElement), 25, 5 + starting_y, 80, 80);
                ctx.stroke();

                //pokemon sprite
                ctx.drawImage(sprite, 35, 15 + starting_y, 60, 60);
                ctx.stroke();

                //types
                if (pokemon_types.length > 1) {
                    let type_name = pokemon_types[0];
                    let elem = (document.getElementsByClassName("type-sprite")[Number(types[type_name]) - 1] as HTMLImageElement);
                    ctx.drawImage(elem, 5, 90 + starting_y, 60, 20);

                    type_name = pokemon_types[1];
                    elem = (document.getElementsByClassName("type-sprite")[Number(types[type_name]) - 1] as HTMLImageElement);
                    ctx.drawImage(elem, 65, 90 + starting_y, 60, 20);
                }
                else {
                    let type_name = pokemon_types[0];
                    let elem = (document.getElementsByClassName("type-sprite")[Number(types[type_name]) - 1] as HTMLImageElement);
                    ctx.drawImage(elem, 35, 90 + starting_y, 60, 20);
                }

                //name
                ctx.font = "30px verdana";
                let text_width = Math.round(ctx.measureText(name).width);
                if (text_width > 300) {
                    text_width = 300;
                }
                ctx.fillStyle = "black";
                ctx.textBaseline = "top";
                ctx.fillText(name, 150 + (300/2 - text_width/2), 10 + starting_y, 300);

                //route
                if (location) {
                    ctx.font = "25px sans-serif";
                    text_width = Math.round(ctx.measureText(location).width);
                    if (text_width > 300) {
                        text_width = 300;
                    }
                    ctx.fillText(location, 150 + (300 / 2 - text_width / 2), 70 + starting_y, 300);
                }

                //border
                if (i !== last_pokemon_index) {
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = this.BORDER_HEIGHT;
                    ctx.beginPath();
                    ctx.moveTo(0, starting_y + this.HEIGHT_PER_POKEMON + (this.BORDER_HEIGHT / 2));
                    ctx.lineTo(this.WIDTH, starting_y + this.HEIGHT_PER_POKEMON + (this.BORDER_HEIGHT / 2));
                    ctx.stroke();
                }

                starting_y += this.HEIGHT_PER_POKEMON + this.BORDER_HEIGHT;
            }
        }
    }
}

const type_colours : Record<string, string> = {
    "normal": "#ACA593",
    "fighting": "#A65238",
    "flying": "#98ABF7",
    "poison": "#B959A3",
    "ground": "#D9B55D",
    "rock": "#BDA65A",
    "bug": "#ADBC21",
    "ghost": "#6263B5",
    "steel": "#ADADC5",
    "fire": "#F75232",
    "water": "#399DFF",
    "grass": "#7CCE52",
    "electric": "#FFC52F",
    "psychic": "#FF71A4",
    "ice": "#5ACEE7",
    "dragon": "#7961EB",
    "dark": "#745A4B",
    "fairy": "#F7B4F7"
}

const types : Record<string, string> = { "normal": "1", "fighting": "2", "flying": "3", "poison": "4", "ground": "5", "rock": "6", "bug": "7", "ghost": "8", "steel": "9", "fire": "10", "water": "11", "grass": "12", "electric": "13", "psychic": "14", "ice": "15", "dragon": "16", "dark": "17", "fairy": "18" }