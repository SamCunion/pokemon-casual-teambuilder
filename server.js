const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

const SWITCH_GAME_DEXES = {
    "37": "12", //brilliant diamond -> diamond
    "38": "13" //shining pearl -> pearl
}

//default path, gets the catalogue page
app.get("/pokemon-teambuilder", (req, res) => {
    if (req.query.game) { //game query param provided, send main app
        res.sendFile(path.resolve(__dirname, "app.html"));
    }
    else { //no game specified, send catalogue
        res.sendFile(path.resolve(__dirname, "index.html"));
    }
})

//gets all games in an array
app.get("/pokemon-teambuilder/database/games", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    fs.readFile(path.join(__dirname, "/database/games.json"), (e, data) => {
        if (e) {
            console.error(e);
            res.send("Error reading game database");
            return;
        }
        res.send(data);
    })
})

//gets the data for the single specified game
app.get("/pokemon-teambuilder/database/games/:game", (req, res) => {
    const game = Number(req.params["game"]);
    if (isNaN(game) || game < 1) {
        res.send("Invalid request");
        return;
    }
    res.setHeader("Content-Type", "application/json");
    fs.readFile(path.join(__dirname, "/database/games.json"), (e, data) => {
        if (e) {
            console.error(e);
            res.send("Error reading game database");
            return;
        }
        const games = JSON.parse(data);
        for (let i = 0; i < games.length; i++) {
            if (Number(games[i].id) == game) {
                res.send(JSON.stringify(games[i]));
                return;
            }
        }
        res.send("Invalid game ID");
        return;
    })
})

app.get("/pokemon-teambuilder/database/pokemon/:game", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const game = Number(req.params["game"]);
    if (isNaN(game) || game < 1) {
        res.send("Invalid request");
        return;
    }
    fs.readFile(path.join(__dirname, "/database/version_pokemon.json"), (e, data) => {
        if (e) {
            console.error("Error reading version_pokemon.json");
            res.send("Error reading version pokemon database");
            return;
        }
        const game_versions = JSON.parse(data);
        //use another games dex if instructed to
        let game_pokemon;
        if (SWITCH_GAME_DEXES[game]) {
            game_pokemon = game_versions[SWITCH_GAME_DEXES[game]];
        }
        else {
            game_pokemon = game_versions[game];
        }
        const out = [];
        fs.readFile(path.join(__dirname, "/database/pokemon.json"), (e, data) => {
            if (e) {
                console.error("Error reading pokemon.json");
                res.send("Error reading pokemon database");
                return;
            }
            const pokemon = JSON.parse(data);
            for (let i = 0; i < game_pokemon.length; i++) {
                let pkmn_id = game_pokemon[i];
                if (pokemon[pkmn_id]) {
                    out.push(pokemon[pkmn_id]);
                }
            }
            res.send(JSON.stringify(out));
        })
    })
})

app.use("/pokemon-teambuilder/public", express.static("public"));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})