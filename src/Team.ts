import App from "./App";

export default class Team {
    private pokemon = [[undefined, null], [undefined, null], [undefined, null], [undefined, null], [undefined, null], [undefined, null]];

    constructor() {
        this.UpdateDisplay();
    }

    public Add(pokemon_obj): boolean {

            for (let i = 0; i < this.pokemon.length; i++) {
                let item = this.pokemon[i][0];
                if (item === undefined) {
                    this.pokemon[i] = [pokemon_obj, null];
                    this.UpdateDisplay();
                    return true;
                }
            }
        
        return false;
    }

    public SetLocation(index: number, location: string) {
        this.pokemon[index][1] = location;
        console.log(`Set location for ${this.pokemon[index][0].name} to ${this.pokemon[index][1]}`);
    }

    public Remove(index: number) {
        console.log("Pokemon removed from team:", this.pokemon[index][0]);
        this.pokemon[index] = [undefined, null];
        this.UpdateDisplay();
    }

    public Get(index: number) {
        return this.pokemon[index];
    }

    public GetAll() {
        return this.pokemon;
    }

    private UpdateDisplay() {
        $(".pokemon-team-sprite").remove();
        for (let i = 0; i < this.pokemon.length; i++) {
            let item = this.pokemon[i][0];
            if (item) {
                let elem = $(`<img class="pokemon-team-sprite" id="pokemon-sprite-${i}" src="/public/img/pokemon-sprites/gifs/${item.name}.gif" />`);
                elem.on("click", e => {
                    this.Remove(i);
                })
                elem.appendTo(`#team-${i+1}`);
            }
        }
        if (App.coverage) {
            App.coverage.Update();
        }
    }
}