import { httpGet } from "../utils";
import { AxiosError } from "axios";
import { fetchAnimixEpisodeSource } from "../scraper/helper";
import { Episode } from "@prisma/client";
import { db } from "../../db";

async function getSource(kitsuId: number, episodeNum: number) {
  let anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (!anime) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }
  let { slug } = anime;

  let episodeSlug = `${slug}-episode-${episodeNum}`;
  console.info(
    `Fetching source and skip times for ${kitsuId} - EP${episodeNum} with slug: ${episodeSlug}`
  );
  let source = await fetchAnimixEpisodeSource({
    episodeId: episodeSlug,
  });
  if (source == "") {
    await db.anime.update({
      where: {
        kitsuId,
      },
      data: {
        available: false,
      },
    });
    return "fail";
  }
  return source;
}

export async function episodes(kitsuId: number, page: number) {
  let anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  let episodes: Partial<Episode>[] = await db.episode.findMany({
    where: {
      animeKitsuId: kitsuId,
      number: {
        gte: (page - 1) * 100,
        lte: page * 100,
      },
    },
  });
  if (episodes.length) return episodes;

  let offset = (page - 1) * 100;

  console.log({ page, offset });

  let recursions = 0;
  for (let i = 0; i < 5; i++) {
    console.debug(
      `Fetching episode information for anime. Kitsu Id: ${kitsuId}, page: ${recursions}`
    );
    let res = await httpGet(
      `https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}&page[limit]=20&sort=number&page[offset]=${
        offset + i * 20
      }`
    );
    res.data.forEach((episode: any) => {
      episodes.push({
        id: parseInt(episode.id),
        number: episode.attributes.number,
        animeKitsuId: kitsuId,
        title:
          episode.attributes.canonicalTitle ?? `EP${episode.attributes.number}`,
      });
    });
    if (!res.links.next) {
      break;
    }
  }
  if (anime.zeroEpisode) {
    let firstEp = episodes[0];
    let zeroEp: any = {};
    Object.assign(zeroEp, firstEp);
    firstEp.title += " 2";
    zeroEp.number = 0;
    episodes.splice(0, 1);
    episodes.unshift(zeroEp, firstEp);
  }
  await db.$transaction(
    episodes.map((ep: any) => db.episode.create({ data: ep }))
  );
  console.log("Inserted", episodes.length, "records");
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
      number: true,
    },
  });
  if (episode && episode.source != "") {
    console.log("Cache hit");
    return episode;
  }

  let epSource = await getSource(kitsuId, episodeNum);
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
      watchTime: true,
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

export async function renewSource(kitsuId: number, episodeNum: number) {
  let source = await getSource(kitsuId, episodeNum);
  await db.episode.update({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    data: {
      source,
    },
  });
  return source;
}
