"use client"

export default function GameSearch() {

    let game_names : HTMLElement[] = [];

    function textChange({target: {value}}) {
        if (game_names.length === 0) { //first time, get the list of games
            let elements = document.getElementsByClassName("game-option");
            game_names = [].slice.call(elements);
        }
        
        game_names.forEach((e) => {
            if (!e.dataset.gamename.toLowerCase().includes(value.toLowerCase())) {
                e.style.display = "none";
            }
            else {
                console.log(e);
                e.style.display = "block";
            }
        })
    }

    return (
        <input type="text" placeholder="Filter Games..." className="form-comtrol mx-auto mt-5" id="game-search" onChange={textChange} />
    )
}