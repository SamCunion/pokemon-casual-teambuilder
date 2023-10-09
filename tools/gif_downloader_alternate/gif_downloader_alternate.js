//bulk downloads gifs from pokemon showdown
const https = require("https");
const fs = require("fs");

console.log("reading json file");
//get the json file
const json_data = fs.readFileSync("./no_gif_pokemon.json");
const stringified_data = json_data.toString();
const array = JSON.parse(stringified_data)["pokemon"];
const entries = array.length;
console.log(`${entries} entries found`);

let complete = 0;
let complete_percent = 0;
const five_percent_interval = Math.floor(entries / 20);

let interval = setInterval(() => {

    if (complete % five_percent_interval === 0) {
        console.log(`${complete_percent}% complete`);
        complete_percent += 5;
    }

    let file = fs.createWriteStream(`gifs/${array[complete + 1]}.gif`)
    https.get(`https://www.smogon.com/dex/media/sprites/xy/${array[complete + 1]}.gif`, r => r.pipe(file));

    complete++;
    if (complete === entries) {
        clearInterval(interval);
        console.log("Complete");
    }
}, 100)

