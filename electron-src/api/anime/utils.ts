import { Anime } from "@prisma/client";
import axios from "axios";
import { headerOption } from "../scraper/helper";
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
  anime.type = data.subtype;
  anime.posterImg = data.posterImage?.large ?? "";
  anime.coverImg = data.coverImage?.large ?? "";
  anime.genres = "";
  anime.score = parseInt(data.averageRating ?? "0") / 10;
  anime.episodes = data.episodeCount;
  return anime;
}

export async function getEpInfo(slug: string) {
  const res = await axios.get(
    `https://gogoanime.consumet.org/anime-details/${slug}`,
    headerOption
  );
  let zeroEpisode =
    parseInt(res.data.episodesList.reverse()[0].episodeNum) === 0;
  let totalEpisodes = parseInt(res.data.totalEpisodes);
  return {
    zeroEpisode,
    totalEpisodes,
  };
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
  anime.available = true;
  try {
    if (!anime.slug && anime.malId) {
      let { slug, dubSlug } = await getAnimeGogoSlug(anime.malId);
      console.log("Fetched slug from mal-sync")
      anime.slug = slug;
      anime.dubSlug = dubSlug;
    }
    console.log({ slug: anime.slug });
    console.log(
      "Fetching episodes for ",
      anime.kitsuId,
      anime.slug,
      anime.episodes
    );

    if (anime.slug) {
      let epInfo = await getEpInfo(anime.slug);

      console.log("received episodes from eplist");
      console.log(epInfo);
      anime.zeroEpisode = epInfo.zeroEpisode;
      anime.episodes = epInfo.totalEpisodes;
    }
    return anime;
  } catch (err) {
    // either error at json conversion for anime with no episode sources / no mal id and no gogoanime slug
    return anime;
  }
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
  )[0];
  if (!malId) return -1;
  return parseInt(malId.attributes.externalId);
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

export async function getAnimeGogoSlug(malId: number) {
  let resp = await axios.get("https://api.malsync.moe/mal/anime/" + malId);
  let animes = Object.keys(resp.data["Sites"]["Gogoanime"]);
  console.log(animes);
  let parts = animes[0].split("/");
  let slug = parts[parts.length - 1];
  let dubSlug = "";
  if (animes.length > 1 && animes[1].endsWith("-dub")) {
    let dubUrlParts = animes[1].split("/");
    dubSlug = dubUrlParts[dubUrlParts.length - 1];
  }
  return { slug, dubSlug };
}