import Kwik from './kwik';
import { TRPCError } from "@trpc/server";
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
    rangeEnd: number,
    isFiller: boolean,
    isBD: boolean
  }[],
  originalId: string,
  rangedEpisodes: number,
  episodesPage: number,
  totalEpisodesPage: number
}> {
  if (!animeId)
    throw new Error("No animeId was provided");
  const res = await proxyAxios.get(`${animepaheBase}/a/${animeId}`, {
  });
  let originalId = res.request.path.split("/")[2] as string;
  console.log({ originalId });
  const episodes: any[] = [];
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
  const firstEp = epList.data.data[0];
  const rangedEpisodes = firstEp.episode2 ? Number(firstEp.episode2) - Number(firstEp.episode) : -1  // for animes like saiki where each "episode" contains multiple episodes.
  epList.data.data.map((ep: { episode: number; episode2?: number; session: string; snapshot: string; duration: number; filler: string; disc: string; }) => {
    console.log(ep);
    episodes.push({
      epNum: ep.episode,
      rangeEnd: ep.episode2 ?? -1,
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
    rangedEpisodes,
    totalEpisodesPage: epList.data.last_page,
    episodes,
  };

  console.log("Finished list");
  return list;
};

export const writeEpisodeSource = async (episode: { animePaheId: string | null, length: number | null, anime: { animePaheId: string | null } }) => {
  const episodeId = episode.animePaheId;
  if (!episode.length || !episodeId)
    throw new TRPCError({ code: "PRECONDITION_FAILED" })
  console.log("Writing source file for episode: " + episodeId);
  try {

    const resp = await proxyAxios.get(`${animepaheBase}/play/${episode.anime.animePaheId}/${episode.animePaheId}`);
    console.log("Successfully received response from animepahe.");
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
  } catch (err) {
    console.log("Failed")
    console.log(err);
  }
};