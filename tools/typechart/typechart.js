const fs = require("fs");
const path = require("path");

const types = csvToObject("types");
const type_efficacy = csvToObject("type_efficacy");

let out = {
    types: {

    },
    offence: {

    },
    defence: {

    }
};

for (let i = 0; i < types.length; i++) {
    let entry = types[i];

    out.types[entry.identifier] = entry.id;
}

for (let i = 0; i < type_efficacy.length; i++) {
    let entry = type_efficacy[i];

    if (!out["offence"][entry.damage_type_id]) {
        out["offence"][entry.damage_type_id] = [];
    }
    if (!out["defence"][entry.target_type_id]) {
        out["defence"][entry.target_type_id] = [];
    }

    out["offence"][entry.damage_type_id][entry.target_type_id] = (Number(entry.damage_factor) / 100);
    out["defence"][entry.target_type_id][entry.damage_type_id] = (Number(entry.damage_factor) / 100);
}

let stringified_out = JSON.stringify(out);
fs.writeFileSync(path.join(__dirname, "types.json"), stringified_out);

console.log("Complete!");

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