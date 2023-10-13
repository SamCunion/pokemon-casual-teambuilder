const fs = require("fs");
const path = require("path");

const pokedex_version_groups = csvToObject("pokedex_version_groups");
const pokemon_dex_numbers = csvToObject("pokemon_dex_numbers");
const versions = csvToObject("versions");

let out = {};

//map version_group_id to version ID
let version_group_to_version = {};
for (let i = 0; i < versions.length; i++) {
    let entry = versions[i];
    if (!version_group_to_version[entry.version_group_id]) {
        version_group_to_version[entry.version_group_id] = [];
    }
    version_group_to_version[entry.version_group_id].push(entry.id);
}

//map pokedex_id to array of version_group_id
let pokedex_to_version_group = {};
for (let i = 0; i < pokedex_version_groups.length; i++) {
    let entry = pokedex_version_groups[i];
    if (!pokedex_to_version_group[entry.pokedex_id]) {
        pokedex_to_version_group[entry.pokedex_id] = [];
    }
    pokedex_to_version_group[entry.pokedex_id].push(entry.version_group_id);
}

/**
 * 
 */
for (let i = 0; i < pokemon_dex_numbers.length; i++) {
    let entry = pokemon_dex_numbers[i];
    let version_groups = pokedex_to_version_group[entry.pokedex_id];
    if (entry.pokedex_id !== "1" && entry.pokedex_id !== "11") {
        for (let j = 0; j < version_groups.length; j++) {
            let vg = version_groups[j];
            let versions = version_group_to_version[vg];
            for (let k = 0; k < versions.length; k++) {
                let version = versions[k];
                if (!out[version]) {
                    out[version] = [];
                }
                if (!out[version].includes(entry.species_id)) {
                    out[version].push(entry.species_id);
                }
            }
        }
    }
}

console.log("Complete!");
let stringified_out = JSON.stringify(out);
fs.writeFileSync(path.join(__dirname, "version_pokemon.json"), stringified_out);

function csvToObject(filename) {
    let out = [];
    let data = fs.readFileSync(`source/${filename}.csv`);
    let string_data = data.toString();
    let entries = string_data.split("\n");
    let fields = entries[0].split(",");
    fields[fields.length - 1] = fields[fields.length - 1].slice(0, fields[fields.length - 1].length - 1);
    for (let i = 1; i < entries.length; i++) {
        let obj = {};
        let values = entries[i].split(",");
        values[values.length - 1] = values[values.length - 1].slice(0, values[values.length - 1].length - 1);
        for (let j = 0; j < fields.length; j++) {
            obj[fields[j]] = values[j];
        }
        out.push(obj);
    }

    console.log(`Formatted ${filename}.csv`);
    return out;
}