import axios from "axios";

export async function getEpisodePage(
  kitsuId: number,
  skip: number,
) {
  let res = await axios.get(
    `https://kitsu.io/api/edge/episodes?filter[mediaId]=${kitsuId}&page[limit]=20&sort=number&page[offset]=${skip}&fields[episodes]=titles,number`
  );
  console.log("Kitsu episode")
  console.log(res.data.data[0]);

  const arr = (res.data.data as { attributes: { titles: { en_us: string, en_jp: string, ja_jp: string }, number: string } }[]).map((ep) => {
    return { title: ep.attributes.titles.en_us ?? ep.attributes.titles.en_jp ?? ep.attributes.titles.ja_jp ?? `EP ${ep.attributes.number}`, number: Number(ep.attributes.number) }
  });
  return arr;
}

export function extractTime(hhMmSs: string) {
  const parts = hhMmSs.split(":").map(o => parseInt(o));
  return parts[2] + parts[1] * 60 + parts[0] * 3600;
}