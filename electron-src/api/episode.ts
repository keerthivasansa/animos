import log from "electron-log";
import { httpGet } from "./utils";
import {
  fetchAnimixEpisodeSource,
  fetchGogoanimeEpisodeSource,
} from "./scraper";
import { db } from "../db";

export async function episodes(kitsuId: number, page: number = 1) {
  let { zeroEpisode } = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  let episodes = await db.episode.findMany({
    where: {
      animeKitsuId: kitsuId,
    },
  });
  if (episodes.length) return episodes;
  log.debug(
    `Fetching episode information for anime. Kitsu Id: ${kitsuId}, page: ${page}`
  );
  let res = await httpGet(
    `https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}`
  );
  episodes = res.data.map((ep) => {
    return {
      id: parseInt(ep.id),
      number: ep.attributes.number,
      animeKitsuId: kitsuId,
      title: ep.attributes.canonicalTitle,
    };
  });
  if (zeroEpisode) {
    let firstEp = episodes[0];
    let zeroEp: any = {};
    Object.assign(zeroEp, firstEp);
    firstEp.title += " 2";
    zeroEp.number = 0;
    episodes.splice(0, 1);
    episodes.unshift(zeroEp, firstEp);
  }
  console.log(episodes);
  await db.$transaction(episodes.map((ep) => db.episode.create({ data: ep })));
  return episodes;
}

export async function getEpisode(kitsuId: number, episodeNum: number) {
  let episode = await db.episode.findUnique({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    select: {
      source: true,
      id: true,
      skipTimes: true,
    },
  });
  if (episode && episode.source != "") {
    console.log("Cache hit");
    return episode;
  }
  let anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  let { id: episodeId } = episode;
  if (!anime) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }

  let { slug } = anime;
  let episodeSlug = `${slug}-episode-${episodeNum}`;
  log.info(`Fetching source and skip times for ${episodeId}`);
  let epSource = await fetchAnimixEpisodeSource({
    episodeId: episodeSlug,
  });
  log.debug(epSource);

  episode = await db.episode.update({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    data: {
      source: epSource,
    },
    select: {
      id: true,
      number: true,
      source: true,
      title: true,
      skipTimes: true,
    },
  });

  return episode;
}

export async function getSkipTimes(
  kitsuId: number,
  episodeNum: number,
  episodeLength: number
) {
  let anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (!anime) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }
  let { malId } = anime;
  let aniSkip = await httpGet(
    `https://api.aniskip.com/v2/skip-times/${malId}/${
      episodeNum == 0 ? 1 : episodeNum
    }?types[]=op&types[]=ed&episodeLength=${episodeLength}`
  );
  let skip = aniSkip.results.map((data) => {
    return {
      type: data.skipType,
      start: data.interval.startTime,
      end: data.interval.endTime,
      episodeNumber: episodeNum,
      episodeAnimeKitsuId: kitsuId,
    };
  });
  console.log(skip);
  await db.$transaction(
    skip.map((skipobj) =>
      db.skipTime.upsert({
        create: skipobj,
        where: {
          episodeAnimeKitsuId_episodeNumber_type: {
            episodeNumber: episodeNum,
            type: skipobj.type,
            episodeAnimeKitsuId: kitsuId,
          },
        },
        update: {},
      })
    )
  );
  return skip;
}
