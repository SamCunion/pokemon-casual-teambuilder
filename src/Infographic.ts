import Html from "./Html";
import InfoOverlay from "./InfoOverlay";
import Pokemon from "./Pokemon";
import Team from "./Team";
import _ from "lodash";

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

        $("#save-infographic-btn").on("click", () => {
            console.log("making infographic")
            const cvs = document.querySelector("#infographic-canvas") as HTMLCanvasElement;
            const img = cvs.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const e = document.createElement("a");
            const filename = "infographic.png";
            e.setAttribute("href", img);
            e.setAttribute("download", filename);
            e.click();
        })
    }

    private Populate(canvas: HTMLCanvasElement) {
        //get pokemon and locations
        const pokemon = this.team.getPokemon();
        const locations = this.team.getLocations();

        //set dimensions
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

        let starting_y = 0;
        _.forEach(pokemon, (p, i) => {
            const location = locations[i];
            if (p) { //pokemon exists in slot, draw next layer
                //start with background
                const y = starting_y;
                drawBackground(y, p, this.WIDTH, this.HEIGHT_PER_POKEMON, () => {
                    drawPokeball(y, () => {
                        drawSprite(y, i, () => {
                            drawTypes(y, this.generation, p, () => {
                                drawName(y, p, () => {
                                    drawRoute(y, location, () => {
                                        let is_last = (i == last_pokemon_index);
                                        drawBorder(y, is_last, this.HEIGHT_PER_POKEMON, this.BORDER_HEIGHT, this.WIDTH, () => {
                                            
                                        })
                                    })
                                })
                            })
                        })
                    })
                })

                starting_y += this.HEIGHT_PER_POKEMON + this.BORDER_HEIGHT;
            }
        })

        async function drawBackground(starting_y:number, pokemon: Pokemon, WIDTH: number, HEIGHT_PER_POKEMON: number, c: Function) {
            //background
            let bg_elem = document.createElement("img");
            let type_id = types[pokemon.types[0]];
            bg_elem.onload = () => {
                canvas.getContext("2d")!.drawImage(bg_elem, 0, starting_y, WIDTH, HEIGHT_PER_POKEMON);
                c();
            }
            bg_elem.src = `/public/img/sprite/bg-type-${type_id}.png`;
        }
        
        async function drawPokeball(starting_y : number, c: Function) {
            let sprite = document.getElementsByClassName("pokeball-sprite")[0] as HTMLImageElement;
            canvas.getContext("2d")!.drawImage(sprite, 25, 5 + starting_y, 80, 80);
            c();
        }

        async function drawSprite(starting_y: number, i: number, c: Function) {
            canvas.getContext("2d")!.drawImage(document.getElementById(`pokemon-sprite-${i}`) as HTMLImageElement, 35, 15 + starting_y, 60, 60);
            c();
        }

        async function drawTypes(starting_y: number, generation: number, p: Pokemon, c: Function) {
            let ctx = canvas.getContext("2d")!;
            let pokemon_types = p.types;
            if (p.past_types && generation <= Number(p.past_types.last_generation)) {
                pokemon_types = p.past_types.types;
            }
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
            c();
        }

        async function drawName(starting_y: number, p: Pokemon, c: Function) {
            let ctx = canvas.getContext("2d")!;
            let name = p.name[0].toUpperCase() + p.name.substring(1, p.name.length);
            ctx.font = "bold 40px dp";
            let text_width = Math.round(ctx.measureText(p.name).width);
            if (text_width > 300) {
                text_width = 300;
            }
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            ctx.fillText(name, 150 + (300 / 2 - text_width / 2), 10 + starting_y, 300);
            c();
        }

        async function drawRoute(starting_y: number, location: string, c: Function) {
            if (location) {
                let ctx = canvas.getContext("2d")!;
                ctx.font = "30px dp";
                let text_width = Math.round(ctx.measureText(location).width);
                if (text_width > 300) {
                    text_width = 300;
                }
                ctx.fillText(location, 150 + (300 / 2 - text_width / 2), 70 + starting_y, 300);
            }
            c();
        }

        async function drawBorder(starting_y: number, is_last: boolean, HEIGHT_PER_POKEMON: number, BORDER_HEIGHT: number, WIDTH: number,  c: Function) {
            if (!is_last) {
                let ctx = canvas.getContext("2d")!;
                ctx.strokeStyle = "black";
                ctx.lineWidth = BORDER_HEIGHT;
                ctx.beginPath();
                ctx.moveTo(0, starting_y + HEIGHT_PER_POKEMON + (BORDER_HEIGHT / 2));
                ctx.lineTo(WIDTH, starting_y + HEIGHT_PER_POKEMON + (BORDER_HEIGHT / 2));
                ctx.stroke();
            }
            c();
        }
    }
}

const types : Record<string, string> = { "normal": "1", "fighting": "2", "flying": "3", "poison": "4", "ground": "5", "rock": "6", "bug": "7", "ghost": "8", "steel": "9", "fire": "10", "water": "11", "grass": "12", "electric": "13", "psychic": "14", "ice": "15", "dragon": "16", "dark": "17", "fairy": "18" }