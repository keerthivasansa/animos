import HLS from "hls-parser";
import Kwik from './kwik';
import { TRPCError } from "@trpc/server";
import { supabase } from "$lib/supabase/index";
import { db } from "$lib/db";
import { USER_AGENT, proxyAxios } from "./helper";
import { load } from "cheerio";

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
  originalId: string,
  episodesPage: number,
  totalEpisodesPage: number
}> {
  if (!animeId)
    throw new Error("No animeId was provided");
  const res = await proxyAxios.get(`${animepaheBase}/a/${animeId}`, {
  });
  let originalId = res.request.path.split("/")[2] as string;
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
  epList.data.data.map((ep: { episode: number; session: string; snapshot: string; duration: number; filler: string; disc: string; }) => {
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
    originalId,
    totalEpisodesPage: epList.data.last_page,
    episodes,
  };

  console.log("Finished list");
  return list;
};

const baseUrl = "https://animepahe.com";

export const writeEpisodeSource = async (episode: { animePaheId: string | null, length: number | null, anime: { animePaheId: string | null } }) => {
  const episodeId = episode.animePaheId;
  if (!episode.length || !episodeId)
    throw new TRPCError({ code: "PRECONDITION_FAILED" })
  console.log("Writing source file for episode: " + episodeId);
  const resp = await proxyAxios.get(`https://animepahe.com/play/${episode.anime.animePaheId}/${episode.animePaheId}`);
  const $ = load(resp.data);
  const sources: { referrer: string, resolution: number, audio: "eng" | "jpn" }[] = [];
  $("#resolutionMenu").children().each((_, elem) => {
    let referrer = $(elem).attr("data-src")!;
    let resolution = parseInt($(elem).attr("data-resolution")!);
    let audio = $(elem).attr("data-audio") as "jpn" | "eng";
    sources.push({ referrer, resolution, audio })
  });
  let res = await Promise.all(sources.filter(src => src.audio != "eng").map(async link => {
    console.time("extraction: " + link.resolution)
    const res = await (new Kwik()).extract(new URL(link.referrer));
    console.timeEnd("extraction: " + link.resolution)
    return {
      quality: link.resolution,
      audio: link.audio,
      url: res[0].url,
      episodeId
    }
  }))

  const insert = await db.$transaction(res.map(link => db.source.create({
    data: link,
    select: {
      audio: true,
      url: true,
      quality: true
    }
  })));
  return insert;
};