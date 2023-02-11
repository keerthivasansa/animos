import type { Episode } from "@prisma/client";
import axios from "axios";

function transformKitsuToEp(data: { attributes: any; id: string; }, kitsuId: number) {
  let attr = data.attributes;
  return {
    id: parseInt(data.id),
    number: attr.number,
    watchTime: 0,
    animeKitsuId: kitsuId,
    title: attr.canonicalTitle ?? `EP${attr.number}`,
    length: undefined
  };
}

export async function getEpisodePage(
  kitsuId: number,
  skip: number,
) {
  let episodes: { id: number, number: number, watchTime: number, animeKitsuId: number, title: string, length: number | null }[] = [];
  let res = await axios.get(
    `https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}&page[limit]=20&sort=number&page[offset]=${skip}`
  );
  episodes.push(...res.data.data.map((ep: any) => transformKitsuToEp(ep, kitsuId)));
  return episodes;
}

export function extractTime(hhMmSs: string) {
  const parts = hhMmSs.split(":").map(o => parseInt(o));
  return parts[2] + parts[1] * 60 + parts[0] * 3600;
}