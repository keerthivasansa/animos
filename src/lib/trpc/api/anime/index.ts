import type { Anime } from "@prisma/client";
import {
  getGenresFromIncluded,
  getMalIdFromIncluded,
  getPartialInfo,
} from "./utils";
import { search } from "$lib/common/search";
import { transformKitsuToAnime } from "$lib/common/utils";
import { db } from "../../db";
import { fetchAnimepaheInfo } from "../../scraper";
import axios from "axios";

// TODO look into other parameters that are useful
// TODO look for upcoming new episodes
const lastWeek = new Date(Date.now() - 7 * 86400 * 1000);

export async function getPosters() {
  const records = await db.anime.findMany({
    where: {
      poster: {
        gt: -1,
      },
      lastUpdated: {
        gt: lastWeek,
      },
    },
    orderBy: {
      poster: "asc",
    },
  });
  if (records.length > 1) return records;
  const res = (await axios.get("https://kitsu.io/api/edge/trending/anime"))
    .data as {
    data: any[];
  };
  const result: Anime[] = await Promise.all(
    res.data.map(async (anime, index) => {
      const newAnime = await getInfo(parseInt(anime.id));
      newAnime.poster = index;
      return newAnime;
    })
  );
  await db.$transaction(
    result.map((anime, index) => {
      if (!anime.ageRating) {
        throw new Error("Missing age rating for " + anime.kitsuId);
      }
      return db.anime.upsert({
        create: anime,
        update: { poster: index },
        where: {
          kitsuId: anime.kitsuId,
        },
      });
    })
  );
  return result;
}

export async function getInfo(kitsuId: number): Promise<Anime> {
  try {
    let anime = await db.anime.findUnique({
      where: {
        kitsuId,
      },
    });
    if (anime != null) {
      console.log("Found anime in cache", anime.kitsuId);
      return anime;
    }
    const info = `https://kitsu.io/api/edge/anime/${kitsuId}?include=categories,mappings&fields[categories]=title,totalMediaCount`;
    const result = (await axios.get(info)).data;
    anime = transformKitsuToAnime(result.data);
    console.debug("Included for kitsuId: " + kitsuId);
    anime.genres = getGenresFromIncluded(result.included).join(",");
    anime.malId = getMalIdFromIncluded(result.included);
    anime = await getPartialInfo(anime);
    const paheInfo = await fetchAnimepaheInfo({ animeId: anime.slug, page: 1 });
    anime.episodeStart = paheInfo.episodes[0].epNum;
    anime.animePaheId = paheInfo.originalId;
    anime.rangedEpisodes = paheInfo.rangedEpisodes;
    console.log("Creating anime with data:");
    console.log(anime);
    await db.anime.create({
      data: anime,
    });
    console.log("Created anime");
    return anime;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create anime");
  }
}

export async function getUserRecommendations() {
  const likedAnime = await db.anime.findFirst({
    select: {
      genres: true,
    },
    where: {
      liked: true,
    },
    orderBy: {
      lastUpdated: "desc",
    },
  });
  let categories = "";
  if (likedAnime != null) {
    categories = likedAnime.genres.split(",").slice(0, 3).join(",");
  } else categories = "Action, Drama";
  return await search(
    {
      categories,
    },
    1,
    {
      sort: "-averageRating",
    }
  );
}

export async function getPopular(page: number) {
  return await search({}, page, {
    sort: "popularityRank",
  });
}

export async function getGenre(genre: string, page: number) {
  return await search({ categories: genre }, page, {
    sort: "popularityRank",
  });
}

interface Genre {
  attributes: { title: string };
}

export async function getGenreNames() {
  const resp = await axios.get(
    "https://kitsu.io/api/edge/categories?sort=-totalMediaCount&page[limit]=20&page[offset]=0&filter[nsfw]=false&fields[categories]=title"
  );
  const data = resp.data.data as Genre[];
  const names = data.map((obj) => obj.attributes.title);
  return names;
}
