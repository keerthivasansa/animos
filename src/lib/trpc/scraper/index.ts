import HLS from "hls-parser";
import Kwik from './kwik';
import { TRPCError } from "@trpc/server";
import { supabase } from "$lib/supabase/index";
import { db } from "$lib/db";
import { USER_AGENT, proxyAxios } from "./helper";

const animepaheBase = `https://animepahe.com`;
const animepaheApi = `https://animepahe.com/api`;

export async function fetchAnimepaheInfo({ animeId, page = 1 }: { animeId: string | null, page: number }): Promise<{
  episodes: {
    epNum: number,
    episodeId: string,
    thumbnail: string,
    duration: string,
    isFiller: boolean,
    isBD: boolean
  }[],
  episodesPage: number,
  totalEpisodesPage: number
}> {
  if (!animeId)
    throw new Error("No animeId was provided");
  const res = await proxyAxios.get(`${animepaheBase}/a/${animeId}`, {
  });
  let originalId = res.request.path.split("/")[2];
  console.log({ originalId });
  const epList = await proxyAxios.get(animepaheApi, {
    params: {
      m: "release",
      id: originalId,
      sort: "episode_asc",
      page,
    },
    xsrfCookieName: "XSRF-TOKEN",
    headers: {
      "User-Agent": USER_AGENT
    }
  });
  console.log("Fetched episode list from animepahe: ", epList.status)
  let episodes: any[] = [];
  epList.data.data.map((ep) => {
    episodes.push({
      epNum: ep.episode,
      episodeId: ep.session,
      thumbnail: ep.snapshot,
      duration: ep.duration,
      isFiller: ep.filler ? true : false,
      isBD: ep.disc === "BD" ? true : false,
    });
  });

  let list = {
    episodesPage: page,
    totalEpisodesPage: epList.data.last_page,
    episodes,
  };

  console.log("Finished list");
  return list;
};

const baseUrl = "https://animepahe.com";

export const writeEpisodeSource = async (episode: { animePaheId: string | null, length: number | null }) => {
  const episodeId = episode.animePaheId;
  if (!episode.length)
    throw new TRPCError({ code: "PRECONDITION_FAILED" })
  console.log("Writing source file for episode: " + episodeId);
  const epLength = episode.length;
  const { data } = await proxyAxios.get(`${baseUrl}/api?m=links&id=${episodeId}`, {
    headers: {
      Referer: baseUrl,
      "User-Agent": USER_AGENT
    },
    xsrfCookieName: "XSRF-TOKEN",
  });
  console.log(data.data);
  const links = data.data.map((item) => ({
    quality: Object.keys(item)[0],
    iframe: item[Object.keys(item)[0]].kwik,
    size: item[Object.keys(item)[0]].filesize,
    audio: item[Object.keys(item)[0]].audio,
  }));
  let res = await Promise.all(links.filter(link => !link.dub).map(async link => {
    console.time("extraction: " + link.quality)
    const res = await (new Kwik()).extract(new URL(link.iframe));
    console.timeEnd("extraction: " + link.quality)
    return {
      quality: link.quality,
      audio: link.audio,
      url: res[0].url,
      isM3U8: res[0].isM3U8,
      size: link.size
    }
  }))
  console.log(res);
  let variants = res.map(src => {
    console.log(src.quality, Math.ceil(src.size / 1024 / 1024), "MB", "Bitrate: ", Math.round((src.size * 8) / epLength))
    return new HLS.types.Variant({
      uri: src.url.replace("cache", "files"), // convert all URLs into NA file URL 
      resolution: {
        width: src.quality,
        height: src.quality * 16 / 9
      },
      bandwidth: Math.round((src.size * 8) / epLength),
    })
  }
  );
  let master = new HLS.types.MasterPlaylist({ variants });
  let uploadResult = await supabase.storage.from("sources").upload(`${episodeId}.m3u8`, HLS.stringify(master))
  console.log("uploaded file successfully");
  console.log(uploadResult.data);
  if (uploadResult.error) {
    console.error("Error uploading the file");
    console.error(uploadResult.error);
    const err = uploadResult.error as unknown as { statusCode: string };
    if (err.statusCode != '409')
      return;
  }
  await db.episode.update({
    where: {
      animePaheId: episode.animePaheId ?? ""
    },
    data: {
      sourceTaken: true
    }
  })

  return;
};