//bulk downloads gifs from pokemon showdown
const https = require("https");
const fs = require("fs");

console.log("reading csv file");
//get the csv file
const csv_data = fs.readFileSync("./pokemon.csv");
const stringified_data = csv_data.toString();
const line = stringified_data.split("\n");
const entries = line.length - 1;
console.log(`${entries} entries found`);

let pokemon_names = [];
line.forEach(item => {
    let ln = item.split(",");
    pokemon_names.push(ln[1]);
})

let complete = 0;
let complete_percent = 0;
const five_percent_interval = Math.floor(entries / 20);

let interval = setInterval(() => {

    if (complete % five_percent_interval === 0) {
        console.log(`${complete_percent}% complete`);
        complete_percent+=5;
    }

    let file = fs.createWriteStream(`gifs/${pokemon_names[complete+1]}.gif`)
    https.get(`https://play.pokemonshowdown.com/sprites/ani/${pokemon_names[complete + 1]}.gif`, r => r.pipe(file));

    complete++;
    if (complete === entries) {
        clearInterval(interval);
        console.log("Complete");
    }
}, 100)

