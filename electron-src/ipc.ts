import { Anime } from "@prisma/client";
import { ipcMain } from "electron";
import { api } from "./api-v2";
import { getGenre, getPosters, getRecommendations } from "./api/anime";
import { episodes, getEpisode } from "./api/episode";
import { db } from "./db";

ipcMain.handle("anime:info", async (event, kitsuId: number) => {
  console.info("Cache fail, fetching info for", kitsuId);
  try {
    let info = await api.anime.getInfo(kitsuId);
    return info;
  } catch (err) {
    console.log(err);
  }
});

ipcMain.handle("anime:posters", async (event) => {
  let res = (await getPosters()) as Anime[];
  return res;
});

ipcMain.handle("anime:search", async (event, query: string) => {
  let results = await api.anime.search(query);
  return results;
});

ipcMain.handle("anime:genre", async (event, genre: string) => {
  let result = await getGenre(genre);
  return result;
});

ipcMain.handle("anime:recommendations", async (event, malId: number) => {
  let result = await getRecommendations(malId);
  return result;
});

ipcMain.handle("episode:info", async (event, kitsuId: number) => {
  let result = await episodes(kitsuId);
  return result;
});

ipcMain.handle(
  "episode:get",
  async (event, malId: number, slug: string, episodeNum: number) => {
    let result = await getEpisode(malId, slug, episodeNum);
    return result;
  }
);

ipcMain.handle("cache:http-delete", async (event) => {
  await db.response.deleteMany({});
  return "ok";
});
