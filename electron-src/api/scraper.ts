/*
These scraping functions are taken from https://github.com/IGRohan/AnimeAPI
Special thanks to IGRohan
*/
import axios from "axios";
import { load } from "cheerio";
import {
  getAjaxParams,
  decryptAjaxResponse,
  encodeString,
  decodeStreamingLinkAnimix,
} from "../helper";

const gogoBase = "https://gogoanime.lu/";
const gogoBase2 = "https://gogoanime.gg/";
const episodeListPage = "https://ajax.gogo-load.com/ajax/load-list-episode";
const goloadStreaming = "https://goload.pro/streaming.php";
const animixBase = "https://animixplay.to/";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = { headers: { "User-Agent": USER_AGENT } };

export const fetchAnimixEpisodeSource = async ({ episodeId }) => {
  let episodeGogoLink;

  if (!episodeId) throw new Error("No episode id was provided");
  const animeId = episodeId.split("-").reverse().splice(2).reverse().join("-");
  console.log({ animeId });
  const episodeNum = episodeId.split("-").splice(-1).join("");

  const res = await axios.get(animixBase + `v1/${animeId}`, headerOption);
  const $ = load(res.data);
  const epList = JSON.parse($("#epslistplace").text());

  console.log({ episodeNum });

  if (episodeNum == "0") {
    console.log("Zero episode detected");
    episodeGogoLink = new URL("https:" + epList["ep0"]);
  } else if (epList.extra) {
    if (episodeNum in epList.extra) {
      episodeGogoLink = new URL("https:" + epList.extra[episodeNum]);
    } else {
      episodeGogoLink = new URL("https:" + epList[episodeNum - 1]);
    }
  } else {
    episodeGogoLink = new URL("https:" + epList[episodeNum - 1]);
  }
  console.log(episodeGogoLink);

  let liveApiLink;

  //Checking if the episode source link is already a Plyr link or not
  if (episodeGogoLink.href.includes("player.html")) {
    liveApiLink = episodeGogoLink.href;
  } else {
    const content_id = episodeGogoLink.searchParams.get("id");
    liveApiLink =
      "https://animixplay.to/api/cW9" +
      encodeString(`${content_id}LTXs3GrU8we9O${encodeString(content_id)}`);
  }

  const src = await decodeStreamingLinkAnimix(liveApiLink);

  return src;
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
