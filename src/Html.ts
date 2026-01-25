
export default {
    credits: `
        <div id="credits-box">
            <h1>Information:</h1>
            <p>This tool helps you create a well-balanced team for your pokémon playthrough! Select the Pokémon that you want on your team from the list, and the type effectiveness breakdown will show how balanced your team is. If you're struggling to fill your team, press the "Suggest" or "Randomise" button for some ideas!<br /><br />Pressing the arrow next to each Pokéball lets you know where in the game the selected Pokémon can be found. By selecting one of the options (or providing a location if one can't be found), the location will be shown on the team's summary when you generate an Infographic (this gives you a saveable image containing your Pokémon, and where you wish to catch them)!</p>
            <h1>Hotkeys:</h1>
            <ul>
                <li>Tab - Focuses Pokémon filter</li>
                <li>Escape - Unfocuses Pokémon filter</li>
                <li>Enter - Generates infographic</li>
                <li>R - Randomise</li>
                <li>Shft + R - Flip randomise switch
                <li>S - Suggest Pokémon</li>
                <li>Shft + S - Flip suggestion switch</li>
                <li>Shft + L - Flip legendary switch</li>
                <li>Shft + M - Flip Mythic Switch</li>
                <li>Shft + C - Clear party</li>
            </ul>
            <h1>Credits:</h1>
            <ul>
                <li>Web design and programming - Sam Cunion</li>
                <li>Animated sprites - <a target='_blank' rel='noopener noreferrer' href="https://pokemonshowdown.com/">Pokémon Showdown</a></li>
                <li>Pokémon &copy; - Nintendo/Gamefreak/The Pokémon Company</li>
                <li>Database - <a target='_blank' rel='noopener noreferrer' href="https://pokeapi.co/">PokéAPI</a></li>
            </ul>
        </div>
    `,
    infographic: `
        <div id="infographic-container" class="d-flex flex-wrap justify-content-center">
            <p class="mt-3">Save this image to your device so that you can reference it in your playthrough!</p>
            <canvas id="infographic-canvas" class="" ></canvas>
        </div>
    `,
    route_select: `
        <div class="text-center" id="route-select-container">
            <h3>Select Route:</h3>
            <p id="route-warning-text" class="text-danger"></p>
            <div id="route-select-list-container" >

            </div>
        </div>
    `
}