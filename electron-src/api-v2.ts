/**
 * anime - info[malId] / search[query] / posters / recommended / genre[genre]
 * episode - source[animeId, episodeNum] / info[animeId, epStart, epEnd?]
 */
import * as anime from "./api/anime/index"
import * as episode from "./api/episode"

export const api = { anime, episode };