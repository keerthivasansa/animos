import { batchHttpGet, httpGet } from "./utils";
import type { Anime } from "@prisma/client";
import { load } from "cheerio";
import { db } from "../db";

// MalId -> Kitsu -> KitsuID
// KitsuId -> Kitsu -> Info
// MalId -> Animix -> GogoanimeSlug
// TODO look into other parameters that are useful
// TODO look for upcoming new episodes

function transformKitsuToAnime(kitsuData): Anime {
  let anime: any = {};
  let { attributes: data } = kitsuData;
  anime.synopsis = data.synopsis;
  anime.kitsuId = parseInt(kitsuData.id);
  anime.title_en = data.titles.en_us ?? data.titles.en;
  anime.title_jp = data.titles.en_jp;
  anime.ageRating = data.ageRating ?? "G";
  anime.title = data.canonicalTitle;
  anime.posterImg = data.posterImage?.large ?? "";
  anime.coverImg = data.coverImage?.large ?? "";
  anime.score = parseInt(data.averageRating ?? "0") / 10;
  anime.episodes = data.episodeCount;
  return anime;
}

async function fetchGenre(name: string) {
  let genre = await db.genre.findUnique({
    where: {
      name,
    },
  });
  if (genre) return genre.malId;
  let res = await httpGet("https://api.jikan.moe/v4/genres/anime");
  await db.$transaction(
    res.data.map((genre) => {
      return db.genre.create({
        data: {
          name: genre.name,
          malId: genre.mal_id,
        },
      });
    })
  );
  return fetchGenre(name);
}

export async function getRecommendations(malId: number) {
  let res = await httpGet(
    `https://api.jikan.moe/v4/anime/${malId}/recommendations`
  );
  return res.data.slice(0, 25).map((data) => data.entry);
}

// TODO change to kitsu
export async function getGenre(genre: string) {
  let genreId = await fetchGenre(genre);

  console.log("Fetching animes in genre:", genre, " id:", genreId);
  let url = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&type=tv&sort=desc`;
  let res = await httpGet(url);
  return res.data;
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
    result.map((anime, index) => {
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

async function getGenres(kitsuId: number) {
  let response = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}/categories?sort=-totalMediaCount`
  );
  let genreArr = response.data
    .map((data) => data.attributes.title)
    .slice(0, 5)
    .sort();
  return genreArr.join(",");
}

export interface AnimeWithGenre extends Anime {
  genre: string[];
}

export async function getPartialInfo(
  animeData: Anime
): Promise<AnimeWithGenre> {
  let anime: AnimeWithGenre = { ...animeData, genre: [] };
  if (!anime.malId) anime.malId = await getMalId(anime.kitsuId);
  if (!anime.slug) {
    let animix = `https://animixplay.to/assets/rec/${anime.malId}.json`;
    let result = await httpGet(animix);
    let slugs = result["Gogoanime"].map((obj) => obj.url.split("/").pop());
    anime.slug = slugs[0];
    anime.dubSlug = slugs[1];
  }
  if (!anime.episodes && anime.slug) {
    let gogoInfo = await httpGet(`https://gogoanime.lu/category/${anime.slug}`);
    const $ = load(gogoInfo);
    anime.episodes = parseInt(
      $("#episode_page > li").last().find("a").attr("ep_end") ?? "0"
    );
  }
  return anime;
}

function getGenresFromIncluded(included) {
  let genresObjs = included.filter((obj) => obj.type == "categories");
  console.log(
    genresObjs.map((obj) => {
      return {
        name: obj.attributes.title,
        count: obj.attributes.totalMediaCount,
      };
    })
  );
  return genresObjs
    .sort((a, b) => b.attributes.totalMediaCount - a.attributes.totalMediaCount)
    .map((obj) => obj.attributes.title);
}

function getMalIdFromIncluded(included) {
  let malId = included.filter(
    (obj) => obj.attributes.externalSite == "myanimelist/anime"
  )[0].attributes.externalId;
  return parseInt(malId);
}

export async function getInfo(kitsuId: number): Promise<Anime> {
  let info = `https://kitsu.io/api/edge/anime/${kitsuId}?include=categories,mappings&fields[categories]=title,totalMediaCount`;
  let result = await httpGet(info);
  let anime = transformKitsuToAnime(result.data);
  console.debug("Included for kitsuId: " + kitsuId);
  anime.genres = getGenresFromIncluded(result.included).join(",");

  console.log({ genres: anime.genres });
  anime.malId = getMalIdFromIncluded(result.included);
  console.log("Anime MAL ID: ", anime.malId);
  let animix = `https://animixplay.to/assets/rec/${anime.malId}.json`;
  let animixRes = await httpGet(animix);
  let slugs = animixRes["Gogoanime"].map((obj) => obj.url.split("/").pop());
  anime.slug = slugs[0];
  anime.dubSlug = slugs[1];
  if (!anime.episodes && anime.slug) {
    let gogoInfo = await httpGet(`https://gogoanime.lu/category/${anime.slug}`);
    const $ = load(gogoInfo);
    anime.episodes = parseInt(
      $("#episode_page > li").last().find("a").attr("ep_end") ?? "0"
    );
  }
  return anime;
}

async function getMalId(kitsuId: number) {
  let res = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}/mappings`
  );
  let data = res.data.filter(
    (obj) => obj.attributes.externalSite == "myanimelist/anime"
  )[0];
  console.log(data);
  console.log(data.attributes.externalId);
  return parseInt(data.attributes.externalId);
}

export async function search(query: string) {
  let resp = await httpGet(
    `https://kitsu.io/api/edge/anime?filter[text]=${query}`
  );
  let result = resp.data.map((anime) => {
    let t_anime = transformKitsuToAnime(anime);
    console.log(t_anime);
    t_anime.slug = "";
    t_anime.dubSlug = "";
    return t_anime;
  });
  return result;
}
