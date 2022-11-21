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

export async function getGenre(genre: string) {
  let genreId = await fetchGenre(genre);

  console.log("Fetching animes in genre:", genre, " id:", genreId);
  let url = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&type=tv&sort=desc`;
  let res = await httpGet(url);
  return res.data;
}

export async function getPosters() {
  let res = await httpGet("https://kitsu.io/api/edge/trending/anime");
  return await Promise.all(
    res.data.map(async (anime) => {
      let data = transformKitsuToAnime(anime);
      data.genres = await getGenres(data.kitsuId);
      return data;
    })
  );
}

async function getGenres(kitsuId: number) {
  let genres = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}/genres`
  );
  return genres.data.map((data) => data.name).join(",");
}

export interface AnimeWithGenre extends Anime {
  genre: string[];
}

export async function getPartialInfo(
  animeData: Anime
): Promise<AnimeWithGenre> {
  let anime: AnimeWithGenre = { ...animeData, genre: [] };
  if (!anime.malId) anime.malId = await getMalId(anime.kitsuId);
  if (!anime.genres) {
    let genres = await httpGet(
      `https://kitsu.io/api/edge/anime/${anime.kitsuId}/genres`
    );
    anime.genres = genres.data.map((data) => data.name).join(",");
  }

  if (anime.genres) {
    anime.genre = anime.genres.split(",") as any;
  }
  console.log("Genre:", anime.genre);
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

async function infoWithKitsu(
  kitsuId: number,
  malId?: number,
  mapping: boolean = false
): Promise<Anime> {
  let info = mapping
    ? `https://kitsu.io/api/edge/mappings/${kitsuId}/item`
    : `https://kitsu.io/api/edge/anime/${kitsuId}`;
  console.log({ info });
  let result2 = await httpGet(info);

  let anime = transformKitsuToAnime(result2.data);
  let genreUrl = `https://kitsu.io/api/edge/anime/${anime.kitsuId}/genres`;
  let genre = await httpGet(genreUrl);
  console.log(genre.data);
  anime.genres = genre.data.map((genre) => genre.attributes.name).join(",");
  anime.malId = malId;
  if (!malId) anime.malId = await getMalId(kitsuId);
  console.log("Anime MAL ID: ", anime.malId);
  let animix = `https://animixplay.to/assets/rec/${anime.malId}.json`;
  let result = await httpGet(animix);
  let slugs = result["Gogoanime"].map((obj) => obj.url.split("/").pop());
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

export async function info(kitsuId: number): Promise<Anime> {
  return infoWithKitsu(kitsuId);
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
