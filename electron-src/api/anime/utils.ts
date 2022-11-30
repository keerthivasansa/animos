import { Anime } from "@prisma/client";
import axios from "axios";
import { load } from "cheerio";
import { db } from "../../db";
import { headerOption } from "../scraper";
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
  const res = await axios.get(`https://animixplay.to/v1/${slug}`, headerOption);
  const $ = load(res.data);
  const epList = JSON.parse($("#epslistplace").text());
  let zeroEpisode = Object.keys(epList).includes("ep0");
  let totalEpisodes = epList.eptotal;
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

export async function getPartialInfo(
  anime: Anime,
  kitsuSlug: string
): Promise<Anime> {
  console.log("Slug:", kitsuSlug);
  if (!anime.malId) anime.malId = await getMalId(anime.kitsuId);

  if (anime.genres == "") anime.genres = await getGenres(anime.kitsuId);
  anime.available = true;

  if (!anime.slug && anime.malId && anime.malId > 0) {
    let animix = `https://animixplay.to/assets/rec/${anime.malId}.json`;
    try {
      let result = await httpGet(animix);
      if (result["Gogoanime"]) {
        let slugs = result["Gogoanime"].map((obj) => obj.url.split("/").pop());
        anime.slug = slugs[0];
        anime.dubSlug = slugs[1];
      }
    } catch {
      anime = await db.anime.create({
        data: {
          available: false,
          ageRating: "G",
          genres: "",
          episodes: 0,
          kitsuId: anime.kitsuId,
          posterImg: "",
          title: "",
          score: 0,
          synopsis: "",
        },
      });
      return anime;
    }
  } else {
    console.log("Alternative method to get slug");
    anime.slug = await getAlternativeSlug(
      kitsuSlug,
      anime.title || anime.title_en || anime.title_jp
    );
    console.log({ slug: anime.slug });
  }
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

function stringSigPart(word: string) {
  if (!word) return word;
  word = word.replace(/[!@#$%^&*():-]/g, "");
  let articles = ["the", "a", "an", "in"];
  let nw = word
    .split(" ")
    .filter((o) => !articles.includes(o.toLowerCase()))
    .join(" ");
  return nw.toLowerCase();
}

function stringSimilarity(s1: string, s2: string) {
  var longer = s1;
  var shorter = s2;
  if (!s1 || !s2) return 0;
  console.log({ longer, shorter });
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

async function getAlternativeSlug(kitsuSlug: string, kitsuTitle: string) {
  let resp = await axios.get(
    `https://gogoanime.tel/search.html?keyword=${kitsuSlug}`
  );
  const $ = load(resp.data);
  let sigTitle = stringSigPart(kitsuTitle);
  let slug = "";
  $("p.name > a").each((i, elem) => {
    let animeTitle = $(elem).text();
    let sigAnime = stringSigPart(animeTitle);
    console.log({
      sigAnime,
      sigTitle,
      match: stringSimilarity(sigAnime, sigTitle),
    });
    if (!slug && stringSimilarity(sigAnime, sigTitle) > 0.95) {
      console.log("Found match");
      slug = $(elem).attr("href").split("/")[2];
    }
  });
  return slug;
}
