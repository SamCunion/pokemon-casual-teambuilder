/**
 * Pokemon class holds information on a pokemon in context
 */

export type PokemonData = {
    id: string;
    name: string;
    is_legendary: boolean;
    is_mythic: boolean;
    stat_total: number;
    locations: Record<string, Array<string>>;
    types: Array<string>;
    past_type?: PastType;
}

type PastType = {
    last_generation: string;
    types: Array<string>;
}

export default class Pokemon {
    public id: number;
    public name: string;
    public is_legendary: boolean;
    public is_mythic: boolean;
    public stat_total: number;
    public locations: Record<string, Array<string>>;
    public types: Array<string>;
    public past_types: PastType|null;
    public is_in_party: boolean = false;
    public teammate_score: number = 0;
    private list_elem: HTMLDivElement|null = null;

    constructor(po: PokemonData) {
        this.id = Number(po.id);
        this.name = po.name;
        this.is_legendary = po.is_legendary;
        this.is_mythic = po.is_mythic;
        this.stat_total = po.stat_total;
        this.locations = po.locations;
        this.types = po.types;
        this.past_types = po.past_type ?? null;
    }

    public setListElem(e: HTMLDivElement) {
        this.list_elem = e;
    }
    public getListElem() : HTMLDivElement {
        return this.list_elem!;
    }
    public removeListElem() {
        this.list_elem = null;
    }
}