import Html from "./Html";
import InfoOverlay from "./InfoOverlay";

export default class App {

    public static hasInitiated: boolean = false;

    public static Init(game_obj) {
        $("#page-app").show();
        console.log(game_obj);

        /**
         * Generate infographic button
         */
        $("#generate-infographic-button").on("click", e => {
            InfoOverlay.setContent(Html.infographic);
            InfoOverlay.Show();
        })

        App.hasInitiated = true;
    }
}