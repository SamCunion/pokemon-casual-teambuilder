
export default class InfoOverlay {
    private static elem: HTMLElement;
    private static content: string = "";
    private static exit_button;
    public static is_active = false;

    public static Init() {
        InfoOverlay.exit_button = $('<button id="info-overlay-close" class="app-styled-button" >Close</button>');
        $(InfoOverlay.exit_button).on("click", () => {
            InfoOverlay.Hide();
        })
        InfoOverlay.elem = $("#info-overlay")[0];
        $(InfoOverlay.elem).hide();

        InfoOverlay.elem.addEventListener("click", () => {
            InfoOverlay.Hide();
        })

        document.getElementById("info-overlay-content").addEventListener("click", e => e.stopPropagation());
    }

    public static Show(): void {
        $(InfoOverlay.elem).fadeIn(300);
        InfoOverlay.is_active = true;
    }

    public static Hide(): void {
        $(InfoOverlay.elem).fadeOut(300);
        InfoOverlay.is_active = false;
    }

    public static setContent(content: string): void {
        InfoOverlay.content = content;
        document.getElementById("info-overlay-content").innerHTML = content;
        $("#info-overlay-content").append(InfoOverlay.exit_button);
    }
}