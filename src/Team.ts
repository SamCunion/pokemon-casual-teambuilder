import App from "./App";

export default class Team {
    private pokemon = [undefined, undefined, undefined, undefined, undefined, undefined];

    constructor() {
        this.UpdateDisplay();
    }

    public Add(pokemon_obj): boolean {

            for (let i = 0; i < this.pokemon.length; i++) {
                let item = this.pokemon[i];
                if (item === undefined) {
                    this.pokemon[i] = pokemon_obj;
                    this.UpdateDisplay();
                    return true;
                }
            }
        
        return false;
    }

    public Remove(index: number) {
        console.log("Pokemon removed from team:", this.pokemon[index]);
        delete this.pokemon[index];
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
            let item = this.pokemon[i];
            if (item) {
                let elem = $(`<img class="pokemon-team-sprite" src="/public/img/pokemon-sprites/gifs/${item.name}.gif" />`);
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