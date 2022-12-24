/*
These scraping functions are taken from https://github.com/IGRohan/AnimeAPI
Special thanks to IGRohan
*/
import axios from "axios";
import { load } from "cheerio";
import {
  getAjaxParams,
  decryptAjaxResponse,
} from ".";

const gogoBase = "https://gogoanime.lu/";
const gogoBase2 = "https://gogoanime.gg/";
const episodeListPage = "https://ajax.gogo-load.com/ajax/load-list-episode";
const goloadStreaming = "https://goload.pro/streaming.php";
const gogoApiBase = "https://gogoanime.consumet.org/";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
export const headerOption = { headers: { "User-Agent": USER_AGENT } };

export const fetchAnimixEpisodeSource = async ({ episodeId }) => {
  if (!episodeId) throw new Error("No episode id was provided");
  const animeId = episodeId.split("-").reverse().splice(2).reverse().join("-");
  const episodeNum = episodeId.split("-").splice(-1).join("");
  try {
    const res = await axios.get(
      gogoApiBase + `vidcdn/watch/${animeId}-episode-${episodeNum}`,
      headerOption
    )
    return res.data.sources[0].file
  } catch (e) {
    console.error("Episode source not found");
    console.error(e)
    return "";
  }
};

export const fetchGogoanimeEpisodeSource = async ({ episodeId }) => {
  try {
    let sources: any[] = [];
    let sources_bk: any[] = [];

    let gogoWatchLink;
    if (episodeId.includes("episode")) {
      const res = await axios.get(gogoBase2 + episodeId);
      const $ = load(res.data);

      const gogoWatch = $("#load_anime > div > div > iframe").attr("src");
      gogoWatchLink = new URL("https:" + gogoWatch);
    } else gogoWatchLink = new URL(`${goloadStreaming}?id=${episodeId}`);

    const gogoServerRes = await axios.get(gogoWatchLink.href, headerOption);
    const $$ = load(gogoServerRes.data);

    const params = await getAjaxParams(
      $$,
      gogoWatchLink.searchParams.get("id")
    );

    const fetchRes = await axios.get(
      `${gogoWatchLink.protocol}//${gogoWatchLink.hostname}/encrypt-ajax.php?${params}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const finalSource = await decryptAjaxResponse(fetchRes.data);
    if (!finalSource.source) return { error: "No sources found" };

    finalSource.source.map((src) => sources.push(src));
    finalSource.source_bk.map((src) => sources_bk.push(src));

    return {
      Referer: gogoWatchLink.href,
      sources: sources,
      sources_bk: sources_bk,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      error_message: err,
    };
  }
};
