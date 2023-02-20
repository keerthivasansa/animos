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
  let records = await db.anime.findMany({
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
  let res = (await axios.get("https://kitsu.io/api/edge/trending/anime")).data as {
    data: any[];
  };
  let result: Anime[] = await Promise.all(
    res.data.map(async (anime, index) => { let newAnime = await getInfo(parseInt(anime.id)); newAnime.poster = index; return newAnime })
  );
  await db.$transaction(
    result.map((anime, index) => {
      if (!anime.ageRating)
        throw new Error("Missing age rating for " + anime.kitsuId);
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
    if (anime) {
      console.log("Found anime in cache", anime.kitsuId);
      return anime;
    }
    let info = `https://kitsu.io/api/edge/anime/${kitsuId}?include=categories,mappings&fields[categories]=title,totalMediaCount`;
    let result = (await axios.get(info)).data;
    anime = transformKitsuToAnime(result.data);
    console.debug("Included for kitsuId: " + kitsuId);
    anime.genres = getGenresFromIncluded(result.included).join(",");

    console.log({ genres: anime.genres });
    anime.malId = getMalIdFromIncluded(result.included);
    anime = await getPartialInfo(anime);
    let episodes = await fetchAnimepaheInfo({ animeId: anime.slug, page: 1 });
    anime.episodeStart = episodes.episodes[0].epNum;
    anime.animePaheId = episodes.originalId;
    console.log("Creating anime with data:");
    console.log(anime);
    await db.anime.create({
      data: anime
    });
    console.log("Created anime");
    return anime;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create anime");
  }
}


export async function getUserRecommendations() {
  let likedAnime = await db.anime.findFirst({
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
  if (likedAnime)
    categories = likedAnime.genres.split(",").slice(0, 3).join(",");
  else categories = "Action, Drama";
  return search(
    {
      categories,
    },
    1,
    {
      sort: "-averageRating",
    }
  );
}

export function getPopular(page: number) {
  return search({}, page, {
    sort: "popularityRank",
  });
}

export function getGenre(genre: string, page: number) {
  return search({ categories: genre }, page, {
    sort: "popularityRank",
  });
}

type Genre = { attributes: { title: string; }; }

export async function getGenreNames() {
  let resp = await axios.get(
    "https://kitsu.io/api/edge/categories?sort=-totalMediaCount&page[limit]=20&page[offset]=0&filter[nsfw]=false&fields[categories]=title"
  );
  const data = resp.data.data as Genre[];
  let names = data.map((obj) => obj.attributes.title);
  return names;
}
