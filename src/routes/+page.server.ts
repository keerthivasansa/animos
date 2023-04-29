import { AnimeService } from "@server/services/anime"

export const load = async () => {
    const trendingList = await AnimeService.getTrending();
    return {
        trendingList
    }
}