const fs = require("fs");
const path = require("path");

/**
 * Info required:
 * ID
 * Name
 * Stat totals
 * Types
 * Legendary list/Mythic List
 * Unevolved Forms
 * Locations of unevolved/themselves
 * In national dex of game
 */

/**
 * Algorithm:
 * pokemon.csv - id becomes the key. Name becomes value. species_id becomes value. Filter out -mega and -totem and -gmax
 * pokemon_species.csv - Evolution chain becomes value. Evolves from becomes value. Evolution chain becomes its own object with the ID being the key holding an array of pokemon ID in the chain
 * pokemon_species.csv - is_legendary and is_mythical values also added to each valid key
 * pokemon_stats.csv - each key gets their stat values 1-6 toatled, and becomes a value
 * types.csv - types are converted to a lookup table for next step
 * pokemon_types.csv - each key gets their types, added to an array that holds max 2 and becomes a value
 * locations.csv - build lookup object to convert id to name
 * encounters.csv - for each pokemon, add a "location" object, with each version ID as the key, and its locations names in an array
 * evolution_chain object - loop through every list, if its id doesnt appear for an item's "evolves from species", it gets isFinal set to true, else false. If it does "evolve from", add the child pokemon to its own location object
 * finally loop through the finished list, removing any entries that dont have "isFinal", also remove isFinal from entries, constructing the final output json
 */

/**
 * ENCOUNTERS.CSV SHOWS LOCATION_AREA_ID, USE LOCATION_AREAS TO MAP TO LOCATION
 */

//Load CSV to JSON
const encounters = csvToObject("encounters");
const location_areas = csvToObject("location_areas");
const location_names = csvToObject("location_names");
const pokemon_species = csvToObject("pokemon_species");
const pokemon_stats = csvToObject("pokemon_stats");
const pokemon_types = csvToObject("pokemon_types");
const pokemon = csvToObject("pokemon");
const types = csvToObject("types");


let species = {};
let evolution_chains = {};
let type_lookup = {};
let location_area_to_location = {};
let location_id_to_name = {};

//id becomes the key. Name becomes value. species_id becomes value. Filter out -mega and -totem and -gmax
for (let i = 0; i < pokemon.length; i++) {
    let entry = pokemon[i];
    if (!((entry.identifier.includes("-mega")) || (entry.identifier.includes("-totem")) || (entry.identifier.includes("-gmax")))) {
        species[entry.id] = {id: entry.id, name: entry.identifier, species: entry.species_id};
    }
}

console.log("Loaded initial pokemon");

//Evolution chain becomes value. Evolves from becomes value. Evolution chain becomes its own object with the ID being the key holding an array of pokemon ID in the chain
//is_legendary and is_mythical values also added to each valid key
let species_keys = Object.keys(species);
for (let i = 0; i < pokemon_species.length; i++) {
    let entry = pokemon_species[i];
    if (!evolution_chains[entry.evolution_chain_id]) {
        evolution_chains[entry.evolution_chain_id] = [];
    }
    evolution_chains[entry.evolution_chain_id].push(entry.id);

    for (let j = 0; j < species_keys.length; j++) {
        if (species[species_keys[j]].species === entry.id) {
            let e = species[species_keys[j]];
            e.evolution_chain = entry.evolution_chain_id;
            e.evolves_from = entry.evolves_from_species_id ? entry.evolves_from_species_id : null;
            e.is_legendary = Boolean(Number(entry.is_legendary));
            e.is_mythic = Boolean(Number(entry.is_mythic));
            e.stat_total = 0;
            e.locations = {};
        }
    }
}

console.log("Filled in species");

//each key gets their stat values 1-6 toatled, and becomes a value

for (let i = 0; i < pokemon_stats.length; i++) {
    let entry = pokemon_stats[i];
    if (entry.stat_id > 0 && entry.stat_id < 7 && species[entry.pokemon_id]) {
        species[entry.pokemon_id].stat_total += Number(entry.base_stat);
    }
}

console.log("Stat totals calculated");

//types are converted to a lookup table for next step
for (let i = 0; i < types.length; i++) {
    let entry = types[i];
    type_lookup[entry.id] = entry.identifier;
}

//each key gets their types, added to an array that holds max 2 and becomes a value

for (let i = 0; i < pokemon_types.length; i++) {
    let entry = pokemon_types[i];
    if (species[entry.pokemon_id]) {
        if (!species[entry.pokemon_id].types) {
            species[entry.pokemon_id].types = [];
        }
        species[entry.pokemon_id].types.push(type_lookup[entry.type_id]);
    }

}
console.log("Types applied");

//map location_area to location_id
for (let i = 0; i < location_areas.length; i++) {
    let entry = location_areas[i];
    location_area_to_location[entry.id] = entry.location_id;
}

//map location ids to location names
for (let i = 0; i < location_names.length; i++) {
    let entry = location_names[i];
    if (entry.local_language_id === "9") {
        location_id_to_name[entry.location_id] = entry.name;
    }

}

//for each pokemon, add a "location" object, with each version ID as the key, and its locations names in an array
for (let i = 0; i < encounters.length; i++) {
    let entry = encounters[i];
    if (species[entry.pokemon_id]) { //pokemon exists
        if (!species[entry.pokemon_id].locations[entry.version_id]) {
            species[entry.pokemon_id].locations[entry.version_id] = [];
        }
        let location_name = location_id_to_name[location_area_to_location[entry.location_area_id]];
        if (species[entry.pokemon_id].locations[entry.version_id].indexOf(location_name) < 0) {
            species[entry.pokemon_id].locations[entry.version_id].push(location_name);
        }
    }
}
console.log("Encounter locations added");

//loop through every list, if its id doesnt appear for an item's "evolves from species", it gets isFinal set to true, else false.
/**
 *  loop through each evolution chain
 *  get the species object for each, set isFinal to true for all
 *  add the species' evolves_from value to a temporary array
 *  loop again through the evolution chain, and set isFinal to false if their ID appears in the temporary array
 */
let keys = Object.keys(evolution_chains);
for (let i = 0; i < keys.length; i++) {
    let chain_id = keys[i];
    let chain_items = evolution_chains[chain_id];
    let group_evolves_from = [];
    for (let j = 0; j < chain_items.length; j++) {
        let this_species = species[chain_items[j]];
        this_species.isFinal = true;
        group_evolves_from.push(this_species.evolves_from);
    }
    for (let j = 0; j < chain_items.length; j++) {
        let this_species = species[chain_items[j]];
        if (group_evolves_from.indexOf(this_species.id) >= 0) {
            this_species.isFinal = false;
        }
    }
}
console.log("Found Final Evolutions")

//If it does "evolve from", add the child pokemon to its own location object
species_keys = Object.keys(species);
for (let i = 1; i < species_keys.length; i++) {
    if (species[i]) {
        let entry = species[i];
        if (entry.isFinal) {
            entry.locations = getLineLocations(entry.id);
        }
    }
}
console.log("Combined Locations");

//finally loop through the finished list, removing any entries that dont have "isFinal", also remove isFinal from entries, constructing the final output json
species_keys = Object.keys(species);
for (let i = 0; i < species_keys.length; i++) {
    let entry = species[species_keys[i]];
    if (!entry.isFinal) {
        delete species[species_keys[i]];
    }
    else {
        delete species[species_keys[i]].isFinal;
    }
}

console.log("Completed Finishing Touches");

let stringified_out = JSON.stringify(species);
fs.writeFileSync(path.join(__dirname, "pokemon.json"), stringified_out);

console.log("Complete!");

//======================================================================================================================

function csvToObject(filename) {
    let out = [];
    let data = fs.readFileSync(`source/${filename}.csv`);
    let string_data = data.toString();
    let entries = string_data.split("\n");
    let fields = entries[0].split(",");
    fields[fields.length-1] = fields[fields.length-1].slice(0, fields[fields.length-1].length - 1);
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

function getLineLocations(parent_id) {
    let spec = species[parent_id];
    if (spec.evolves_from) {
        return MergeLocations(spec.locations, getLineLocations(spec.evolves_from));
    }
    else {
        return spec.locations;
    }
}

function MergeLocations(obj1, obj2) {
    let new_obj = {};
    let obj1k = Object.keys(obj1);
    let obj2k = Object.keys(obj2);
    for (let i = 0; i < obj1k.length; i++) {
        let k = obj1k[i];
        if (obj2k.includes(k)) {
            new_obj[k] = obj1[k];
            for (let j = 0; j < obj2[k].length; j++) {
                if (!new_obj[k].includes(obj2[k][j])) {
                    new_obj[k].push(obj2[k][j]);
                }
            }
        }
        else {
            new_obj[k] = obj1[k];
        }
    }
    for (let i = 0; i < obj2k.length; i++) {
        let k = obj2k[i];
        if (!obj1k.includes(k)) {
            new_obj[k] = obj2[k];
        }
    }
    return new_obj;
}