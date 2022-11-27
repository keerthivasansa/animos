import log from "electron-log";
import { httpGet } from "./utils";
import { AxiosError } from "axios";
import {
  fetchAnimixEpisodeSource,
  fetchGogoanimeEpisodeSource,
} from "./scraper";
import { db } from "../db";
import { Episode } from "@prisma/client";

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

  let recursions = 0;
  let apiData: Array<JSON> = [];
  for (let i = -1; i < recursions; i++) {
    log.debug(
      `Fetching episode information for anime. Kitsu Id: ${kitsuId}, page: ${recursions}`
    );
    let res = await httpGet(`https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}&page[limit]=20&page[offset]=${recursions * 20}`);

    (res.data as JSON[]).forEach((episode) => {
      apiData.push(episode)
    })

    if (res.links.next !== undefined) {
      recursions += 1;
    }
  }
  
  episodes = apiData.map((ep: any) => {
    return {
      id: parseInt(ep.id),
      number: ep.attributes.number,
      animeKitsuId: kitsuId,
      title: ep.attributes.canonicalTitle,
      description: ep.attributes.description,
      watchTime: 0,
      source: "",
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
  // log.debug(episodes);
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
      title: true,
      animeKitsuId: true,
      watchTime: true,
      number: true
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
      animeKitsuId: true,
      skipTimes: true,
      watchTime: true
    },
  });

  return episode;
}

export async function getSkipTimes(
  kitsuId: number,
  episodeNum: number,
  episodeLength: number
) {
  if (episodeNum == 0) return [];

  let anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (!anime) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }
  let { malId } = anime;
  try {
    let aniSkip = await httpGet(
      `https://api.aniskip.com/v2/skip-times/${malId}/${episodeNum}?types[]=op&types[]=ed&episodeLength=${episodeLength}`
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
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.status == 404) {
        console.log("No skip times found");
        let skip = await db.skipTime.create({
          data: {
            end: 9999,
            start: 9999,
            type: "nil",
            episodeAnimeKitsuId: kitsuId,
            episodeNumber: episodeNum,
          },
        });
        return [skip];
      }
    }
  }
}
