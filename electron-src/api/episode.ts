import log from "electron-log";
import { httpGet } from "./utils";
import { fetchGogoanimeEpisodeSource } from "./scraper";

export async function episodes(malId: number, page: number = 1) {
  log.debug(
    `Fetching episode information for anime. Kitsu Id: ${malId}, page: ${page}`
  );
  let res = await httpGet(
    `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`
  );

  return res.data.map((ep) => {
    return {
      id: ep.mal_id,
      title: ep.title,
      title_jp: ep.title_romanji,
      filler_recap: ep.filler || ep.recap,
    };
  });
}

export async function getEpisode(
  malId: number,
  animeSlug: string,
  episodeNum: number
) {
  let episodeId = `${animeSlug}-episode-${episodeNum}`;
  log.info(`Fetching source and skip times for ${episodeId}`);
  let gogoSource = await fetchGogoanimeEpisodeSource({ episodeId });
  log.debug(gogoSource)
  let aniSkip = await httpGet(
    `https://api.aniskip.com/v1/skip-times/${malId}/${episodeNum}?types=op&types=ed`
  );
  let skip = {};
  aniSkip.results.forEach((data) => {
    skip[data.skip_type] = data.interval;
  });
  return { sources: gogoSource.sources, skip };
}
