import { getInfo, getPosters, getUserRecommendations } from "../api/anime";
import { t } from "../server";
import { z } from "zod"

export const animeRouter = t.router({
    get: t.procedure.input(z.number()).query(async ({ input }) => {
        let anime = await getInfo(input);
        return anime;
    }),
    trendingPosters: t.procedure.query(async () => {
        let posters = await getPosters();
        return posters;
    }),
    userRecommendations: t.procedure.query(async () => {
        let recommendations = await getUserRecommendations();
        return recommendations;
    }), 
    hello: t.procedure.query(() => "world")
});