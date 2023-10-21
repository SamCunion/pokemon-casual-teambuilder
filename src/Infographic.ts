import App from "./App";
import Html from "./Html";
import InfoOverlay from "./InfoOverlay";
import Team from "./Team";
import Typechart from "./lib/types.json";
const types = Typechart.types;

export default class Infographic {

    private static readonly WIDTH: number = 500;
    private static readonly HEIGHT_PER_POKEMON: number = 120;
    private static readonly BORDER_HEIGHT: number = 5;

    private team: Team;

    
    constructor(team: Team) {
        this.team = team;
    }

    public Show() {
        InfoOverlay.setContent(Html.infographic);
        InfoOverlay.Show();
        this.Populate(($("#infographic-canvas")[0] as HTMLCanvasElement));
    }

    private Populate(canvas: HTMLCanvasElement) {
        //set dimensions
        let ctx = canvas.getContext("2d");
        let pokemon = this.team.GetAll();
        let total_pokemon = 0;
        let last_pokemon_index = 0;
        for (let i = 0; i < pokemon.length; i++) {
            if (pokemon[i][0]) {
                total_pokemon++;
                last_pokemon_index = i;
            }
        }
        canvas.height = (total_pokemon * (Infographic.HEIGHT_PER_POKEMON + Infographic.BORDER_HEIGHT));
        canvas.width = Infographic.WIDTH;

        //pokeball sprite
        let pokeball = document.getElementsByClassName("pokeball-sprite")[0];

        //draw for each
        let starting_y = 0;
        for (let i = 0; i < pokemon.length; i++) {
            let current_pokemon = pokemon[i];
            if (current_pokemon[0]) {
                let pokemon_types = current_pokemon[0].types;
                if (current_pokemon[0].past_type && App.current_version.generation <= current_pokemon[0].past_type.last_generation) {
                    pokemon_types = current_pokemon[0].past_type.types;
                }
                let location = current_pokemon[1];
                let name = current_pokemon[0].name[0].toUpperCase() + current_pokemon[0].name.substring(1, current_pokemon[0].name.length);
                let sprite = document.getElementById(`pokemon-sprite-${i}`) as HTMLImageElement;
                //background
                ctx.fillStyle = type_colours[pokemon_types[0]];
                ctx.fillRect(0, starting_y, Infographic.WIDTH, Infographic.HEIGHT_PER_POKEMON);

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
                    ctx.lineWidth = Infographic.BORDER_HEIGHT;
                    ctx.beginPath();
                    ctx.moveTo(0, starting_y + Infographic.HEIGHT_PER_POKEMON + (Infographic.BORDER_HEIGHT / 2));
                    ctx.lineTo(Infographic.WIDTH, starting_y + Infographic.HEIGHT_PER_POKEMON + (Infographic.BORDER_HEIGHT / 2));
                    ctx.stroke();
                }

                starting_y += Infographic.HEIGHT_PER_POKEMON + Infographic.BORDER_HEIGHT;
            }
        }
    }
}

const type_colours = {
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