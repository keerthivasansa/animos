import { Anime } from "@prisma/client";
import { load } from "cheerio";
import { httpGet } from "../utils";

export function transformKitsuToAnime(kitsuData: Record<string, any>): Anime {
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
  anime.genres = "";
  anime.score = parseInt(data.averageRating ?? "0") / 10;
  anime.episodes = data.episodeCount;
  return anime;
}

export async function getGenres(kitsuId: number) {
  let response = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}/categories?sort=-totalMediaCount`
  );
  let genreArr = response.data
    .map((data) => data.attributes.title)
    .slice(0, 5)
    .sort();
  return genreArr.join(",");
}

export async function getPartialInfo(anime: Anime): Promise<Anime> {
  if (!anime.malId) anime.malId = await getMalId(anime.kitsuId);

  if (anime.genres == "") anime.genres = await getGenres(anime.kitsuId);
  if (!anime.slug) {
    let animix = `https://animixplay.to/assets/rec/${anime.malId}.json`;
    let result = await httpGet(animix);
    let slugs = result["Gogoanime"].map((obj) => obj.url.split("/").pop());
    anime.slug = slugs[0];
    anime.dubSlug = slugs[1];
  }
  console.log(
    "Fetching episodes for ",
    anime.kitsuId,
    anime.slug,
    anime.episodes
  );
  let gogoInfo = await httpGet(`https://gogoanime.lu/category/${anime.slug}`);
  const $ = load(gogoInfo);
  let epStart = $("#episode_page").find("a").first().attr("ep_start");
  let epEnd = $("#episode_page").find("a").last().attr("ep_end");
  console.log({ epStart, epEnd });
  anime.episodes = parseInt(epEnd);
  anime.zeroEpisode = epStart == "0";
  return anime;
}

export async function recurseRelations(kitsuId: number, roles: string[]) {
  let related = {
    character: [],
    sequel: [],
    other: [],
    spinoff: [],
    prequel: [],
    alternative_version: [],
  };
  let resp = await httpGet(
    `https://kitsu.io/api/edge/anime/${kitsuId}?include=mediaRelationships.destination`
  );
  let data = resp.included;
  let relatedAnime = data.filter((obj) => obj.type == "anime");
  let mediaRelationships = data.filter(
    (obj) =>
      obj.type == "mediaRelationships" &&
      obj.relationships.destination.data.type == "anime"
  );
  await Promise.all(
    mediaRelationships.map(async (obj) => {
      let role = obj.attributes.role;
      let animeId = obj.relationships.destination.data.id;

      if (roles.includes(role)) {
        let animeData = relatedAnime.filter((anime) => anime.id == animeId)[0];
        console.log(role);
        let anime = transformKitsuToAnime(animeData);
        related[role].push(anime);
        let res = await recurseRelations(animeId, [role]);
        console.log("Result from inner node:");
        Object.keys(res).forEach((key) => {
          console.log(key, related[key]);
          related[key] = related[key].concat(res[key]);
        });
      }
    })
  );
  return related;
}

export function getGenresFromIncluded(included) {
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

export function getMalIdFromIncluded(included) {
  let malId = included.filter(
    (obj) => obj.attributes.externalSite == "myanimelist/anime"
  )[0].attributes.externalId;
  return parseInt(malId);
}

export async function getMalId(kitsuId: number) {
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
