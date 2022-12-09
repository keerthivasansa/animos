import { httpGet } from "../utils";
import type { Anime } from "@prisma/client";
import {
  getGenresFromIncluded,
  getMalIdFromIncluded,
  getPartialInfo,
  transformKitsuToAnime,
} from "./utils";
import { db } from "../../db";

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
  let res = (await httpGet("https://kitsu.io/api/edge/trending/anime")) as {
    data: any[];
  };
  let result: Anime[] = await Promise.all(
    res.data.map(async (anime, index) => getInfo(parseInt(anime.id)))
  );
  await db.$transaction(
    result.map((anime, _) => {
      if (!anime.ageRating)
        throw new Error("Missing age rating for " + anime.kitsuId);
      return db.anime.upsert({
        create: anime,
        update: { poster: anime.poster },
        where: {
          kitsuId: anime.kitsuId,
        },
      });
    })
  );
  return result;
}

export async function getInfo(kitsuId: number): Promise<Anime> {
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
  let result = await httpGet(info);
  anime = transformKitsuToAnime(result.data);
  console.debug("Included for kitsuId: " + kitsuId);
  anime.genres = getGenresFromIncluded(result.included).join(",");

  console.log({ genres: anime.genres });
  anime.malId = getMalIdFromIncluded(result.included);
  anime = await getPartialInfo(anime, result.data.attributes.slug);
  await db.anime.upsert({
    create: anime,
    update: anime,
    where: {
      kitsuId,
    },
  });
  return anime;
}

export async function search(
  filters: Record<string, any>,
  page: number,
  otherParams: Record<string, string> = {}
) {
  const searchUrl = new URL("https://kitsu.io/api/edge/anime");
  searchUrl.searchParams.set("include", "categories,mappings");
  searchUrl.searchParams.set("page[limit]", "20");

  searchUrl.searchParams.set("page[offset]", ((page - 1) * 20).toString());
  Object.keys(filters).forEach((k) =>
    searchUrl.searchParams.set(`filter[${k}]`, filters[k])
  );
  Object.keys(otherParams).forEach((k) =>
    searchUrl.searchParams.set(k, otherParams[k])
  );

  console.log({ url: searchUrl.toString() });
  let resp = await httpGet(searchUrl.toString());

  resp.data = resp.data.filter(
    (anime) => anime.relationships.mappings.data.length > 0
  );

  if (resp.meta.count == 0) return { data: [], totalItems: 0, currentPage: 1 };
  let categorieObjs = resp.included.filter((obj) => obj.type == "categories");
  console.log(categorieObjs[0]);
  let result = resp.data.map((anime) => {
    let t_anime = transformKitsuToAnime(anime);
    let categoryIds = anime.relationships.categories.data.map((cat) => cat.id);
    console.log(categoryIds);
    let categories = categoryIds.map(
      (cat) => categorieObjs.filter((obj) => obj.id == cat)[0].attributes.title
    );
    console.log(categories);
    t_anime.genres = categories.join(",");
    t_anime.slug = "";
    t_anime.dubSlug = "";
    return t_anime;
  });
  console.timeEnd("search");
  return { data: result, totalItems: resp.meta.count, currentPage: page };
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
