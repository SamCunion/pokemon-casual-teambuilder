
export default abstract class InfoOverlay {
    private elem: HTMLElement;
    private exit_button: HTMLDivElement;

    constructor() {
        this.exit_button = $('<button id="info-overlay-close" class="app-styled-button" >Close</button>').get(0) as HTMLDivElement;
        $(this.exit_button).on("click", () => {
            this.Exit();
        })
        this.elem = $("#info-overlay")[0];
        $(this.elem).hide();

        this.elem.addEventListener("click", () => {
            this.Exit();
        })

        document.getElementById("info-overlay-content").addEventListener("click", e => e.stopPropagation());
    }

    public Show(): void {
        $(this.elem).fadeIn(300);
        history.pushState({overlay: true}, "");
    }

    public Exit(): void {
        $(this.elem).fadeOut(300);
    }

    public setContent(content: string): void {
        document.getElementById("info-overlay-content").innerHTML = content;
        $("#info-overlay-content").append(this.exit_button);
    }
}