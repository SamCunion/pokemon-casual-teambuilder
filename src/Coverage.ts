import App from "./App";
import type_info from "./lib/types.json";

export default class Coverage {

    private offence_threats: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private defence_threats: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    private readonly bad_hex: string = "#ff5454";
    private readonly moderate_hex: string = "#ffa91f";
    private readonly good_hex: string = "#8aff54";

    private readonly bad_overall_text: string = "Weak";
    private readonly moderate_overall_text: string = "Okay";
    private readonly good_overall_text: string = "Strong";

    constructor() {
        this.Update();
    }

    public Update() {
        this.offence_threats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.defence_threats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let team = App.team.GetAll();
        for (let i = 0; i < team.length; i++) {
            if (team[i][0]) {
                let pokemon = team[i][0];
                let types = pokemon.types;
                let type_ids = [];
                let accumulated_effacy_def = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                let accumulated_effacy_off = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                for (let j = 0; j < types.length; j++) {
                    type_ids[j] = type_info["types"][types[j]];
                }

                //for each type, loop through the typechart
                for (let j = 0; j < type_ids.length; j++) {
                    let type = type_ids[j];
                    for (let k = 1; k < 19; k++) {
                        accumulated_effacy_def[k] *= Number(type_info["defence"][type][k]);
                        accumulated_effacy_off[k] += (Number(type_info["offence"][type][k]) > 1) ? 1 : 0;
                    }
                }

                //update totals
                for (let j = 1; j < 19; j++) {
                    let def_val = accumulated_effacy_def[j];
                    let off_val = accumulated_effacy_off[j];
                    if (def_val < 1) { //resists
                        (this.defence_threats[j] as number)++;
                    }
                    if (off_val > 1) {
                        (this.offence_threats[j] as number)++;
                    }
                }
            }
        }
        //update display
        for (let i = 1; i < 19; i++) {
            $(`#t-o-${i}`).html(this.offence_threats[i].toString());
            $(`#t-d-${i}`).html(this.defence_threats[i].toString());
        }
        this.UpdateView();
    }

    private UpdateView() {
        //loop through all types and update the indicator accordingly
        let total = 0;
        for (let i = 1; i < 19; i++) {
            let type_strength = 0;
            if (this.offence_threats[i] >= 1) {
                type_strength += 0.5;
            }
            if (this.defence_threats[i] >= 1) {
                type_strength += 0.5;
            }
            switch (type_strength) {
                case 0:
                    $(`#indicator-${i}`).css("background-color", this.bad_hex);
                    break;
                case 0.5:
                    $(`#indicator-${i}`).css("background-color", this.moderate_hex);
                    break;
                case 1:
                    $(`#indicator-${i}`).css("background-color", this.good_hex);
                    break;
            }
            total += type_strength;
        }

        if (total < 12) {
            $("#typechart-result").html(this.bad_overall_text);
        }
        else if (total < 16) {
            $("#typechart-result").html(this.moderate_overall_text);
        }
        else {
            $("#typechart-result").html(this.good_overall_text);
        }
    }
}
