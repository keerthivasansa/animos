import type { PageServerLoad } from "./$types";
import { api } from "$electron-src/api-v2"

export const load: PageServerLoad = async ({ params }) => {
    let kitsuId = parseInt(params.kitsuId)
    let anime = await api.anime.getInfo(kitsuId);
    return {
        anime
    }
};
