import { Episode } from "@prisma/client";
import axios from "axios";

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
