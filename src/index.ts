import "bootstrap/dist/css/bootstrap.min.css"
import "jquery";
import GameSelector from "./GameSelector";
import InfoOverlay from "./InfoOverlay";
import Html from "./Html";
import App from "./App";

class Index {

    public static Main(): void {
        //GameSelector.Init(); TODO: REMOVE - TESTING PURPOSE
        $("#page-game-select").hide();
        App.Init({});
        //TODO: UNTIL HERE

        InfoOverlay.Init();

        document.getElementById("expand-credits").addEventListener("click", () => {
            InfoOverlay.setContent(Html.credits);
            InfoOverlay.Show();
        })
    }
}

Index.Main();