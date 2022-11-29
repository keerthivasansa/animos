import { api } from "$electron-src/api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  console.log("loading");
  let idParam = url.searchParams.get("animeId");
  console.log({ idParam });
  if (!idParam) 
    idParam = '2';
  let kitsuId = parseInt(idParam);
  let anime = await api.anime.getInfo(kitsuId);
  return {
    anime,
  };
};
