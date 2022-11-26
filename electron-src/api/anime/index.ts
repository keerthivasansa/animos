import { httpGet } from "../utils";
import type { Anime } from "@prisma/client";
import {
  getGenres,
  getGenresFromIncluded,
  getMalIdFromIncluded,
  getPartialInfo,
  recurseRelations,
  transformKitsuToAnime,
} from "./utils";
import { load } from "cheerio";
import { db } from "../../db";

// TODO look into other parameters that are useful
// TODO look for upcoming new episodes

// TODO add getGenre
export async function getRecommendations(malId: number) {
  let res = await httpGet(
    `https://api.jikan.moe/v4/anime/${malId}/recommendations`
  );
  return res.data.slice(0, 25).map((data) => data.entry);
}

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
  });
  if (records.length > 1) return records;
  let res = await httpGet("https://kitsu.io/api/edge/trending/anime");
  let result = await Promise.all(
    res.data.map(async (anime) => {
      let data = transformKitsuToAnime(anime);
      console.log({ rating: data.ageRating });
      data.genres = await getGenres(data.kitsuId);
      return data;
    })
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
  anime = await getPartialInfo(anime);
  await db.anime.create({
    data: anime,
  });
  return anime;
}

export async function search(query: string) {
  let resp = await httpGet(
    `https://kitsu.io/api/edge/anime?filter[text]=${query}&include=categories&fields[categories]=title`
  );
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
  return result;
}

export async function getAllRelatedAnime(kitsuId: string, roles: string[]) {
  let related = {
    character: [],
    sequel: [],
    other: [],
    spinoff: [],
    prequel: [],
    alternative_version: [],
  };
  let relatedAnimes = await db.animeRelation.findMany({
    where: {
      sourceId: parseInt(kitsuId),
    },
    select: {
      anime: true,
      role: true,
    },
  });
  if (relatedAnimes.length == 1 && relatedAnimes[0].role == "NULL") {
    // no related anime
    return related;
  } else if (relatedAnimes.length > 0) {
    relatedAnimes.forEach((relation) => {
      related[relation.role].push(relation.anime);
    });
    return related;
  }

  console.log(kitsuId, roles);

  related = await recurseRelations(parseInt(kitsuId), ["prequel", "sequel"]);

  await db.$transaction(
    Object.keys(related)
      .map((key) =>
        related[key].map((anime) => [
          db.anime.upsert({
            where: { kitsuId: anime.kitsuId },
            create: anime,
            update: {},
          }),
          db.animeRelation.create({
            data: {
              role: key,
              sourceId: parseInt(kitsuId),
              destinationId: anime.kitsuId,
            },
          }),
        ])
      )
      .flat(2)
  );
  return related;
}
