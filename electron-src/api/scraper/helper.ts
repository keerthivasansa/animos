import axios from "axios";
import { load } from "cheerio";
import { getAjaxParams, decryptAjaxResponse } from "./index";

const gogoBase2 = "https://gogoanime.gg/";
const goloadStreaming = "https://goload.pro/streaming.php";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
export const headerOption = { headers: { "User-Agent": USER_AGENT } };

export const fetchGogoEpisodeSource = async ({ episodeId }) => {
  try {
    let sources = [];
    let sources_bk = [];

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

    return sources[0].file
  } catch (err) {
    console.log(err);
    return "";
  }
};
