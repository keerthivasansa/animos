import { Episode } from "@prisma/client";
import axios from "axios";
import { headerOption } from "../scraper/helper";
import { download } from "./download";

function transformKitsuToEp(data, kitsuId): Partial<Episode> {
  let attr = data.attributes;
  return {
    id: parseInt(data.id),
    number: attr.number,
    watchTime: 0,
    animeKitsuId: kitsuId,
    title: attr.canonicalTitle ?? `EP${attr.number}`,
  };
}

export async function getEpisodePage(
  kitsuId: number,
  skip: number
): Promise<Partial<Episode>[]> {
  let episodes: Partial<Episode>[] = [];
  for (let i = 0; i < 5; i++) {
    let res = await axios.get(
      `https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}&page[limit]=20&sort=number&page[offset]=${
        skip + i * 20
      }`
    );
    episodes.push(...res.data.data.map((ep) => transformKitsuToEp(ep, kitsuId)));
  }
  return episodes;
}

export async function checkEpisodeResolutions(url: string) {
  let resp = await axios.get(url, headerOption);
  let arr = new Array<string>();

  let lines = resp.data.split("\n");
  lines.forEach((line) => {
    line.split(",").forEach((part) => {
      if (part.startsWith("RESOLUTION")) {
        arr.push(part.split("=")[1]);
      }
    });
  });

  return arr.sort();
}

export function downloadEpisode(
  episodeURL: string,
  outputDir: string,
  outputFileName: string,
  resolution: string
) {
  let listener = download({
    url: episodeURL,
    outputDir: outputDir,
    outputFileName: outputFileName,
    videoSuffix: ".ts",
    resolution: resolution, // Resolution needs to be in the full form of "XxY", ex. "1920x1080"
  });

  listener.on("start", function (d) {
    console.log("started downloading");
  });

  listener.on("progress", function (d) {
    console.log(d);
  });

  listener.on("downloaded", function (d) {
    console.log("downloaded", d);
  });

  listener.on("complete", function (d) {
    console.log("done", d);
  });

  listener.on("error", function (e) {
    console.error("error", e);
  });
}
