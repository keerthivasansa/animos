import { getInfo, getPosters, getUserRecommendations } from "../api/anime";
import { t } from "../server";
import { z } from "zod";

export const animeRouter = t.router({
  get: t.procedure.input(z.number()).query(async ({ input }) => {
    const anime = await getInfo(input);
    console.log("Sending", anime.title, "to client");
    return anime;
  }),
  trendingPosters: t.procedure.query(async () => {
    const posters = await getPosters();
    return posters;
  }),
  userRecommendations: t.procedure.query(async () => {
    const recommendations = await getUserRecommendations();
    return recommendations;
  }),
  hello: t.procedure.query(() => "world"),
});
