import { batchHttpGet, httpGet } from "./utils.js";
import type { Anime } from "@prisma/client";
import { load } from "cheerio";
import { db } from "../db.js";

// MalId -> Kitsu -> KitsuID
// KitsuId -> Kitsu -> Info
// MalId -> Animix -> GogoanimeSlug
// TODO look into other parameters that are useful
// TODO look for upcoming new episodes

function transformKitsuToAnime(kitsuData): Anime {
  let anime: any = {};
  let { attributes: data } = kitsuData;
  anime.synopsis = data.synopsis;
  anime.kitsuId = kitsuData.id;
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
  return res.data.map((anime) => transformKitsuToAnime(anime));
}

export async function getPartialInfo(anime: Anime): Promise<Anime> {
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

async function infoWithKitsu(
  kitsuId: string,
  malId?: number,
  mapping: boolean = false
): Promise<Anime> {
  let info = mapping
    ? `https://kitsu.io/api/edge/mappings/${kitsuId}/item`
    : `https://kitsu.io/api/edge/anime/${kitsuId}`;
  console.log({ info });
  let result2 = await httpGet(info);
  console.log(result2);
  let anime = transformKitsuToAnime(result2.data);
  anime.malId = malId;
  if (!malId) anime.malId = await getMalId(kitsuId);
  let animix = `https://animixplay.to/assets/rec/${malId}.json`;
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

async function getMalId(kitsuId: string) {
  let res = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}/mappings`
  );
  let data = res.data.filter(
    (obj) => obj.attributes.externalSite == "myanimelist/anime"
  );
  return data.externalId;
}

export async function info(malId: number): Promise<Anime> {
  let resp = await httpGet(
    `https://kitsu.io/api/edge/mappings?filter[externalId]=${malId}&externalSite=myanimelist/anime`
  );
  let data = resp.data.filter(
    (obj) => obj.attributes.externalSite == "myanimelist/anime"
  )[0];
  let kitsuMappingId = data.id;
  console.log(kitsuMappingId);
  return infoWithKitsu(kitsuMappingId, malId, true);
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
