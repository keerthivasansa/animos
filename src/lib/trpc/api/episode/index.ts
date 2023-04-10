import axios, { AxiosError } from "axios";
import { fetchAnimepaheInfo, writeEpisodeSource } from "../../scraper/index";
import { db } from "../../db";
import { extractTime, getEpisodePage } from "./utils";
import type { Episode } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function getSource(kitsuId: number, episodeNum: number) {
  let episode = await db.episode.findUnique({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    select: {
      sourceTaken: true,
      animePaheId: true,
      length: true,
      anime: {
        select: {
          animePaheId: true,
        },
      },
    },
  });
  const anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (anime == null) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }

  if (episode == null) {
    const page = Math.ceil(episodeNum / 100);
    console.log("Fetching episodes in page: " + page);
    // this creates entries for the episodes in the current page including current episode
    await getEpisodes(kitsuId, page);
    episode = await db.episode.findUnique({
      where: {
        animeKitsuId_number: {
          animeKitsuId: kitsuId,
          number: episodeNum,
        },
      },
      select: {
        sourceTaken: true,
        animePaheId: true,
        animePaheNum: true,
        anime: {
          select: {
            animePaheId: true,
          },
        },
        length: true,
      },
    });
    if (episode == null) throw new Error("Failed to fetch the episode");
  }
  const epStart = anime.episodeStart;
  if (!episode.animePaheId) {
    const episodePage = Math.ceil(episodeNum / 30);
    const episodesInfo = await fetchAnimepaheInfo({
      animeId: anime.slug,
      page: episodePage,
    });
    console.log(episodesInfo);
    const epData = episodesInfo.episodes.find(
      (_, index) => (episodeNum % 30) - 1 == index
    );
    console.log(epData);
    if (epData == null) throw new Error("Failed to find the matching episode");
    episode.animePaheId = epData.episodeId;
    await db.$transaction(
      episodesInfo.episodes.map((ep) => {
        const number = ep.epNum - epStart + 1;
        return db.episode.update({
          where: {
            animeKitsuId_number: {
              animeKitsuId: kitsuId,
              number,
            },
          },
          data: {
            animePaheId: ep.episodeId,
          },
        });
      })
    );
  }
  const sources = await writeEpisodeSource(episode);
  return sources;
}

export async function getEpisodeHistory(
  episodeNum: number,
  userId: string,
  kitsuId: number
) {
  const history = await db.history.findMany({
    where: {
      userId,
      animeKitsuId: kitsuId,
      episodeNumber: {
        gte: episodeNum,
        lte: episodeNum + 20,
      },
    },
  });
  return history;
}

export async function setWatchTime(
  episodeNumber: number,
  animeKitsuId: number,
  userId: string,
  watchTime: number
) {
  await db.history.update({
    where: {
      episodeNumber_animeKitsuId_userId: {
        animeKitsuId,
        episodeNumber,
        userId,
      },
    },
    data: {
      watchTime,
    },
  });
  return "ok";
}

export async function getEpisodes(
  kitsuId: number,
  currentEp: number
): Promise<Episode[]> {
  const anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (anime == null) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }
  let epNumberFilter: {
    gt: number;
    lte: number;
  };
  let page: number;
  if (!isNaN(anime.rangedEpisodes) && anime.rangedEpisodes > -1) {
    page = Math.ceil(currentEp / anime.rangedEpisodes / 20);
    const start = (page - 1) * 20 * anime.rangedEpisodes;
    const end = page * 20 * anime.rangedEpisodes;
    console.log(anime.rangedEpisodes);
    epNumberFilter = {
      gt: start,
      lte: end,
    };
  } else {
    page = Math.ceil(currentEp / 20);
    epNumberFilter = {
      gt: (page - 1) * 20,
      lte: page * 20,
    };
  }
  const episodes = await db.episode.findMany({
    where: {
      animeKitsuId: kitsuId,
      number: epNumberFilter,
    },
    take: 20,
    orderBy: {
      number: "asc",
    },
  });
  if (episodes.length > 0) {
    return episodes;
  }
  if (anime.rangedEpisodes > -1) {
    const paheInfo = fetchAnimepaheInfo({
      animeId: anime.slug,
      page: 1,
    });
  }
  const offset = (page - 1) * 20;
  const animePahePage = Math.ceil(offset / 30);
  const [newEpisodes, animePaheInfo] = await Promise.all([
    getEpisodePage(kitsuId, offset),
    fetchAnimepaheInfo({
      animeId: anime.slug,
      page: animePahePage,
    }),
  ]);
  const paheEpisodes = animePaheInfo.episodes;
  const animeEpStart = anime.episodeStart;
  console.log(paheEpisodes);
  console.log({ pahe: paheEpisodes.length, kitsu: newEpisodes.length });
  try {
    await db.$transaction(
      newEpisodes.map((ep, index) => {
        console.log(ep.number);
        console.log("Match with", ep.number + animeEpStart - 1);
        const paheEp = paheEpisodes.find(
          (pep) => pep.epNum == ep.number + animeEpStart - 1
        );
        console.log(paheEp);
        if (paheEp == null) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        console.log(ep.number, "ep -> pahe#", paheEp.epNum);
        console.log(paheEp);
        const epData = {
          animePaheNum: paheEp.epNum,
          number: ep.number,
          thumbnail: paheEp.thumbnail,
          title: ep.title,
          length: extractTime(paheEp.duration),
          animeKitsuId: kitsuId,
          animePaheId: paheEp.episodeId,
        };
        console.log(epData);
        return db.episode.create({
          data: epData,
        });
      })
    );
    console.log("Inserted", newEpisodes.length, "records");
    return await getEpisodes(kitsuId, page);
  } catch (err) {
    console.log(err);
    return [];
  }
}
export async function getEpisode(kitsuId: number, episodeNum: number) {
  const episode = await db.episode.findUnique({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    select: {
      anime: {
        select: {
          title: true,
          kitsuId: true,
        },
      },
      title: true,
      animeKitsuId: true,
      animePaheId: true,
      length: true,
      skipTimes: true,
      number: true,
      sources: {
        select: {
          audio: true,
          quality: true,
          url: true,
        },
      },
    },
  });
  if (episode == null) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Missing episode" });
  }
  console.log(episode);
  if (episode && episode.sources.length > 0) {
    console.log("Cache hit");
    return episode;
  } else {
    // get source
    const sources = await getSource(kitsuId, episodeNum);
    if (sources != null) episode.sources = sources;
  }
  return episode;
}

export async function getSkipTimes(kitsuId: number, episodeNum: number) {
  if (episodeNum == 0) return [];

  const anime = await db.anime.findUnique({
    where: {
      kitsuId,
    },
  });
  if (anime == null) {
    throw new Error("Anime not found in the database, kitsuId:" + kitsuId);
  }
  const { malId } = anime;
  try {
    const aniSkip = await axios.get(
      `https://api.aniskip.com/v2/skip-times/${malId}/${episodeNum}?types[]=op&types[]=ed&episodeLength=0`
    );
    const skip = aniSkip.data.results.map(
      (data: { skipType: any; interval: { startTime: any; endTime: any } }) => {
        return {
          type: data.skipType,
          start: data.interval.startTime,
          end: data.interval.endTime,
          episodeNumber: episodeNum,
          episodeAnimeKitsuId: kitsuId,
        };
      }
    );
    console.log(skip);
    await db.$transaction(
      skip.map((skipobj: any) =>
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
        const skip = await db.skipTime.create({
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
  const episode = await db.episode.findUnique({
    where: {
      animeKitsuId_number: {
        animeKitsuId: kitsuId,
        number: episodeNum,
      },
    },
    select: {
      animePaheId: true,
      length: true,
      anime: {
        select: {
          animePaheId: true,
        },
      },
    },
  });
  if (episode == null) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }
  console.log("Renewing source for episode: " + episode.animePaheId);
  await writeEpisodeSource(episode);
  return episode;
}

export async function getHistory(page: number, userId: string) {
  const total = await db.history.count({
    where: {
      userId,
    },
  });
  const episodes = await db.history.findMany({
    where: {
      userId,
    },
    select: {
      anime: {
        select: {
          title: true,
        },
      },
      episode: {
        select: {
          length: true,
        },
      },
      watchTime: true,
    },
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      lastUpdated: "desc",
    },
  });
  return {
    data: episodes,
    totalItems: total,
    currentPage: page,
  };
}
