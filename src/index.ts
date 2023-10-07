import "bootstrap/dist/css/bootstrap.min.css"
import GameSelector from "./GameSelector";
import InfoOverlay from "./InfoOverlay";
import Html from "./Html";

class Index {

    public static Main(): void {
        $("#page-app").hide();
        GameSelector.Init();
        InfoOverlay.Init();

        document.getElementById("expand-credits").addEventListener("click", () => {
            InfoOverlay.setContent(Html.credits);
            InfoOverlay.Show();
        })
    }
}

Index.Main();