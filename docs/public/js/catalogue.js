$(() => {
    //get games object
    let game_elems = [];
    $.getJSON("./database/games.json", (data) => {
        console.log(data);
        populateGameList(data);

        $("#game-search").on("input", ({ target }) => {
            game_elems.forEach(elem => {
                if (!elem.data().gamename.toLowerCase().includes(target.value.toLowerCase())) {
                    $(elem).hide();
                }
                else {
                    $(elem).show();
                }
            })
        })
    })

    /**
     * Populates the game selector list with game panels
     * @param {Array} game_objects list of game descriptor objects 
     */
    function populateGameList(game_objects) {
        for (let i = 0; i < game_objects.length; i++) {
            let game = game_objects[i];
            let elem = $(`<div class="game-option m-3" data-gamename="${game.name}"><img src="./public/img/game-art/${game.img}" class="mx-auto" /></div>`);
            $(elem).on("click", () => {
                location.href = "./app.html?game=" + game.id;
            })
            $("#game-list").append(elem);
            game_elems.push(elem);
        }
    }
})
