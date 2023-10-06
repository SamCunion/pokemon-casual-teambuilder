"use client"

import GameOption from "./GameOption";
import GameSearch from "./GameSearch";
import game_info from "./lib/games.json";

export default function GameSelector(props) {
    

    return (
        <div id="GameSelector">
            <h1 className="text-center mt-4">Casual Pokémon Teambuilder</h1>
            <GameSearch />
            <div id="game-list" className="d-flex flex-wrap" >
                {game_info.games.map((e) => {
                    return (
                        <GameOption item={e} resolve={props.resolve}/>
                    )
                })}
            </div>
        </div>
    )
}