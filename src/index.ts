import "bootstrap/dist/css/bootstrap.min.css"
import "jquery";
import GameSelector from "./GameSelector";
import InfoOverlay from "./InfoOverlay";
import Html from "./Html";
import App from "./App";

class Index {

    public static Main(): void {
        GameSelector.Init();
        InfoOverlay.Init();
        App.Init();

        document.getElementById("expand-credits").addEventListener("click", () => {
            InfoOverlay.setContent(Html.credits);
            InfoOverlay.Show();
        })

        window.addEventListener("hashchange", e => {
            if ((e.newURL.includes("#app") || e.newURL.includes("#select"))) {
                if (e.newURL.includes("#select")) {
                    App.BackToSelect();
                    $("#page-game-select").show();
                    $("#page-app").hide();
                    $(document.body).removeClass("no-scrollbar");
                }
                else {
                    App.Show(GameSelector.game_selected);
                    $("#page-app").show();
                    $("#page-game-select").hide();
                    $(document.body).addClass("no-scrollbar");
                }
            }
        })

        GameSelector.Show();
    }
}

Index.Main();