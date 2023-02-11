import type { Anime } from "@prisma/client";
import axios from "axios";

export async function getEpInfo(kitsuId: number) {
  let [zeroEpisode, totalEpisodes] = await Promise.all([(async () => {
    return false;
  })(), (async () => {
    const res = await axios.get(`https://kitsu.io/api/edge/episodes?filter[mediaType]=Anime&filter[media_id]=${kitsuId}&sort=number`);
    const totalEpisodes = parseInt(res.data.meta.count);
    return totalEpisodes
  })()])
  return {
    zeroEpisode,
    totalEpisodes,
  };
}

export async function getGenres(kitsuId: number) {
  let response = await axios.get(
    `https://kitsu.io/api/edge/anime/${kitsuId}/categories?sort=-totalMediaCount`
  );
  let genreArr = response.data.data
    .map((data: { attributes: { title: any; }; }) => data.attributes.title)
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
      let { slug, dubSlug } = await getProviderId(anime.malId, "animepahe");
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
    console.log(typeof anime.episodes);
    if (typeof anime.episodes != "number") {
      let epInfo = await getEpInfo(anime.kitsuId);
      console.log("received episodes from eplist");
      console.log(epInfo);
      anime.episodes = epInfo.totalEpisodes;
    }
    console.log({ anime });
    return anime;
  } catch (err) {
    console.log("Error when fetching details for " + anime.malId)
    console.error(err);
    throw new Error("Failed to get details for malId");
    // either error at json conversion for anime with no episode sources / no mal id and no gogoanime slug
    return anime;
  }
}

export function getGenresFromIncluded(included: any[]) {
  let genresObjs = included.filter((obj: { type: string; }) => obj.type == "categories");
  console.log(
    genresObjs.map((obj: { attributes: { title: any; totalMediaCount: any; }; }) => {
      return {
        name: obj.attributes.title,
        count: obj.attributes.totalMediaCount,
      };
    })
  );
  return genresObjs
    .sort((a: { attributes: { totalMediaCount: number; }; }, b: { attributes: { totalMediaCount: number; }; }) => b.attributes.totalMediaCount - a.attributes.totalMediaCount)
    .map((obj: { attributes: { title: any; }; }) => obj.attributes.title);
}

export function getMalIdFromIncluded(included: any[]) {
  let malId = included.filter(
    (obj: { attributes: { externalSite: string; }; }) => obj.attributes.externalSite == "myanimelist/anime"
  )[0];
  if (!malId) return -1;
  return parseInt(malId.attributes.externalId);
}

export async function getMalId(kitsuId: number) {
  let res = await axios.get(
    `https://kitsu.io/api/edge/anime/${kitsuId}/mappings`
  );
  let data = res.data.data.filter(
    (obj: { attributes: { externalSite: string; }; }) => obj.attributes.externalSite == "myanimelist/anime"
  )[0];
  console.log(data);
  console.log(data.attributes.externalId);
  return parseInt(data.attributes.externalId);
}

export async function getProviderId(malId: number, provider: string) {
  let resp = await axios.get("https://api.malsync.moe/mal/anime/" + malId);
  let data = resp.data["Sites"][provider]
  let animes = Object.keys(data);
  return { slug: animes[animes.length - 1], dubSlug: "" };
}