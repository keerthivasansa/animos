/*
These scraping functions are taken from https://github.com/IGRohan/AnimeAPI
Special thanks to IGRohan
*/
const axios = require('axios')
const { load } = require('cheerio')
const { getAjaxParams, decryptAjaxResponse } = require("./helper.js");

const gogoBase = 'https://gogoanime.lu/'
const gogoBase2 = 'https://gogoanime.gg/'
const episodeListPage = 'https://ajax.gogo-load.com/ajax/load-list-episode'
const goloadStreaming = 'https://goload.pro/streaming.php'
const animixBase = 'https://animixplay.to/'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
const headerOption = { headers: { 'User-Agent': USER_AGENT } }

const fetchAnimixAnimeInfo = async ({ malId, list = {} }) => {
  try {
    if (!malId)
      return {
        error: "No ID provided",
      };

    const fetchInfo = await axios.get(
      animixBase + `assets/mal/${malId}.json`,
      headerOption
    );
    const fetchInfoLinks = await axios
      .get(animixBase + `assets/rec/${malId}.json`, headerOption)
      .catch((err) => {});

    list = {
      animeTitle: fetchInfo.data.title,
      animeId: fetchInfoLinks?.data["Gogoanime"]
        ? fetchInfoLinks?.data["Gogoanime"][0].url.split("/").reverse()[0]
        : "",
      mal_id: fetchInfo.data.mal_id,
      animeImg: fetchInfo.data.image_url,
      episodes: fetchInfo.data.episodes,
      status: fetchInfo.data.status,
      score: fetchInfo.data.score,
      synopsis: fetchInfo.data.synopsis,
      genres: fetchInfo.data.genres.map((genr) => genr.name),
      studios: fetchInfo.data.studios.map((st) => st.name),
      gogoAnimeLink: fetchInfoLinks?.data["Gogoanime"],
      animepaheLink: fetchInfoLinks?.data["animepahe"],
      zoroLink: fetchInfoLinks?.data["Zoro"],
    };

    return list;
  } catch (err) {
    console.log(err);
    return {
      error: true,
      error_message: err,
    };
  }
};

const fetchGogoanimeEpisodeSource = async ({ episodeId }) => {
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

const fetchGogoAnimeInfo = async ({ animeId, list = {} }) => {
  try {
    let genres = [];
    let episodes = [];

    const res = await axios.get(gogoBase + `category/${animeId}`);
    const $ = load(res.data);

    const animeTitle = $("div.anime_info_body_bg > h1").text();
    const animeImg = $("div.anime_info_body_bg > img").attr("src");
    const type = $("div.anime_info_body_bg > p:nth-child(4) > a").text();
    const synopsis = $("div.anime_info_body_bg > p:nth-child(5)")
      .text()
      .replace("Plot Summary: ", "");
    const releaseDate = $("div.anime_info_body_bg > p:nth-child(7)")
      .text()
      .replace("Released: ", "");
    const status = $("div.anime_info_body_bg > p:nth-child(8) > a").text();
    const otherNames = $("div.anime_info_body_bg > p:nth-child(9)")
      .text()
      .replace("Other name: ", "")
      .replace(/;/g, ",");

    $("div.anime_info_body_bg > p:nth-child(6) > a").each((index, element) => {
      genres.push($(element).attr("title").trim());
    });

    const epStart = $("#episode_page > li").first().find("a").attr("ep_start");
    const epEnd = $("#episode_page > li").last().find("a").attr("ep_end");
    const movieId = $("#movie_id").attr("value");
    const alias = $("#alias_anime").attr("value");

    const episodesPage = await axios.get(
      `${episodeListPage}?ep_start=${epStart}&ep_end=${epEnd}&id=${movieId}&default_ep=${0}&alias=${alias}`
    );
    const $$ = load(episodesPage.data);

    $$("#episode_related > li").each((i, el) => {
      episodes.push({
        episodeId: $(el).find("a").attr("href").split("/")[1],
        epNum: $(el).find(`div.name`).text().replace("EP ", ""),
        episodeUrl: gogoBase + $(el).find(`a`).attr("href").trim(),
      });
    });

    list = {
      animeTitle: animeTitle.toString(),
      type: type.toString(),
      synopsis: synopsis.toString(),
      animeImg: animeImg.toString(),
      releaseDate: releaseDate.toString(),
      status: status.toString(),
      genres,
      otherNames,
      eptotal: epEnd,
      episodes,
    };

    return list;
  } catch (err) {
    console.log(err);
    return {
      error: true,
      error_message: err,
    };
  }
};

const fetchPopular = async ({ list = [], type = 1 }) => {
  try {
    if (type == 1) {
      const res = await axios.get(
        animixBase + "assets/s/popular.json",
        headerOption
      );

      res.data.result.map((anime) => {
        list.push({
          animeTitle: anime.title,
          mal_id: anime.url.split("/").reverse()[0],
          animeImg: anime.picture,
          views: anime.infotext.split(" ")[3],
          score: anime.score / 100,
        });
      });
    } else if (type == 2) {
      const res = await axios(animixBase + "api/search", {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          genre: "any",
          minstr: 99999999,
          orderby: "popular",
        }),
      });

      res.data.result.map((anime) => {
        list.push({
          animeTitle: anime.title,
          animeId: anime.url.split("/").reverse()[0],
          animeImg: anime.picture,
          format: anime.infotext,
          score: anime.score / 100,
        });
      });
    }

    return list;
  } catch (err) {
    console.log(err);
    return {
      error: true,
      error_message: err,
    };
  }
};

module.exports = {
  fetchAnimixAnimeInfo,
  fetchGogoAnimeInfo,
  fetchGogoanimeEpisodeSource,
  fetchPopular,
};
