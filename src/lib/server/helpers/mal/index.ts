import { extractTopAnimeTable } from "./utils";
import axios, { Axios } from "axios";
import { MALSearch } from "./search";

export class MAL {
    private static baseUrl = "https://myanimelist.net";
    private static client: Axios = axios.create({
        baseURL: this.baseUrl
    });
    private readonly malId: number;
    private readonly url: string

    constructor(malId: number) {
        this.malId = malId;
        this.url = `/anime/${malId}`;
    }

    static async getTrending() {
        const response = await MAL.client.get("/topanime.php");
        const result = extractTopAnimeTable(response);
        return result;
    }

    static async getMostPopular() {
        const animeArray = await MALSearch.getSearch({
            sort: {
                type: "popularity",
                order: "desc"
            }
        });
        return animeArray;
    }

    async getInfo() {
        const response = MAL.client.get(this.url);
    }
}