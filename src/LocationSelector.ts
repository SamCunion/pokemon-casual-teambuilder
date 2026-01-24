import InfoOverlay from "./InfoOverlay";
import Html from "./Html";

export default class LocationSelector extends InfoOverlay {

    private options: Array<string>;
    private callback: Function;
    private activeLocation: string;

    constructor(options: Array<string>, activeLocation: string, callback: Function) {
        super();
        this.options = options;
        this.callback = callback;
        this.activeLocation = activeLocation;

        this.setContent(Html.route_select);
    }

    public override Show() {
        super.Show();

        //populate with location options or location selector dialog
        if (!this.options || this.options.length < 1) { //no locations found, manual entry required
            $("#route-warning-text").html("Did not find any wild encounters for pokémon in game. If this is a mistake, you can enter a location into the text box below, which will be used on the infographic instead.");
            let container = $(`<div class="input-group justify-content-center w-100 align-items-center d-flex h-100"></div>`);
            let input = $(`<input type="text" placeholder="Location" class="form-control w-50" style="flex: none"/>`);
            let aside = $(`<div class="input-group-append"></div>`);
            let confirm = $(`<button class="btn btn-primary">Confirm</button>`);
            $(confirm).on("click", e => {
                this.callback((input[0] as HTMLInputElement).value)
                this.Exit();
            })
            input.appendTo(container);
            confirm.appendTo(aside);
            aside.appendTo(container);
            container.appendTo("#route-select-list-container");
        }
        else { //options found, select from list
            $(`<div class="list-group h-100" id="route-list"></div>`).appendTo("#route-select-list-container");
            for (let i = 0; i < this.options.length; i++) {
                let location = this.options[i];
                let item = $(`<a class="location-item list-group-item text-center list-group-item-action align-items-center justify-content-center d-flex ${this.activeLocation == location ? "active" : ""}">${location}</a>`);
                item.on("click", e => {
                    this.callback(location);
                    this.Exit();
                })
                item.appendTo("#route-list");
            }
        }
    }

    public override Exit() {
        this.callback(null);
        super.Exit();
    }

}