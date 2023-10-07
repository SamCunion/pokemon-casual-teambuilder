
export default class InfoOverlay {
    private static elem: HTMLElement;
    private static content: string = "";

    public static Init() {
        InfoOverlay.elem = $("#info-overlay")[0];
        $(InfoOverlay.elem).hide();
        
        document.getElementById("info-overlay-close").addEventListener("click", () => {
            InfoOverlay.Hide();
        })

        InfoOverlay.elem.addEventListener("click", () => {
            InfoOverlay.Hide();
        })

        document.getElementById("info-overlay-content").addEventListener("click", e => e.stopPropagation());
    }

    public static Show(): void {
        $(InfoOverlay.elem).fadeIn(300);
    }

    public static Hide(): void {
        $(InfoOverlay.elem).fadeOut(300);
    }

    public static setContent(content: string): void {
        InfoOverlay.content = content;
        document.getElementById("info-overlay-content").innerHTML = content;
    }
}