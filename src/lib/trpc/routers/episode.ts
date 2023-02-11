import { z } from "zod";
import { t } from "../server";
import { getEpisodes, getEpisode, getEpisodeHistory } from "../api/episode"

export const episodeRouter = t.router({
    get: t.procedure.input(z.object({ episodeNumber: z.number(), kitsuId: z.number() })).query(async ({ input }) => {
        let { kitsuId, episodeNumber } = input;
        let episode = await getEpisode(kitsuId, episodeNumber)
        if (!episode) {
            throw new Error("Failed to get episode");
        }
        return episode;
    }),
    getEpisodePage: t.procedure.input(z.object({
        kitsuId: z.number(), page: z.number()
    })).query(async ({ input }) => {
        let { kitsuId, page } = input;
        let episodes = await getEpisodes(kitsuId, page);
        return episodes;
    }),
    getHistory: t.procedure.input(z.object({
        kitsuId: z.number(),
        episodeNumber: z.number()
    })).query(async ({ ctx, input }) => {
        if (!ctx.user) {
            return []
        }
        let { kitsuId, episodeNumber } = input;
        let start = Math.floor(episodeNumber / 20) * 20;
        let history = await getEpisodeHistory(start, ctx.user.id, kitsuId);
        return history;
    })
})