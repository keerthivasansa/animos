/**
 * anime - info[malId] / search[query] / posters / recommended / genre[genre]
 * episode - source[animeId, episodeNum] / info[animeId, epStart, epEnd?]
 */
import * as anime from "./anime"
import * as episode from "./episode"

export const api = { anime, episode };