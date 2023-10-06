"use client"

export default function Credits({overlayHandler}) {

    function showOverlay() {
        overlayHandler(true)
    }

    return(
        <footer id="credits-bar" className="bg-primary bg-gradient border-top border-4 border-primary">
            <div id="name-credit">
                <p className="ps-3 pt-2 text-light float-start">&copy; Sam Cunion 2023</p>
            </div>
            <div id="credit-expand-button" className="float-end h-100 me-3">
                <p className="text-light pt-2 float-start">Credits:</p>
                <button className="btn btn-outline-light float-end ms-3 top-50" onClick={showOverlay}>...</button>
            </div>
        </footer>
    )
}