import InfoOverlay from "./InfoOverlay";
import Html from "./Html";

export default class Credits extends InfoOverlay {

    constructor() {
        super();
        this.setContent(Html.credits);
    }

}