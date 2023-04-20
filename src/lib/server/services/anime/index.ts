import { Kitsu } from "$lib/server/helpers/kitsu";
import { MAL } from "$lib/server/helpers/mal";

export class AnimeService {
    private malId: number;

    constructor(malId: number) {
        this.malId = malId;
    }

    static async getTrending() {
        const trendingAnime = await MAL.getTrending();

        const promise = trendingAnime.map(async (anime) => {
            const kitsu = new Kitsu(anime.malId);
            const poster = await kitsu.getPoster();
            return { ...anime, poster };
        });

        const result = await Promise.all(promise);

        return result;
    }
}