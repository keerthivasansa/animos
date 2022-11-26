import { Anime } from "@prisma/client";
import { ipcMain } from "electron";
import { api } from "./api";
import {
  getAllRelatedAnime,
  getPosters,
  getRecommendations,
} from "./api/anime";
import { episodes, getEpisode, getSkipTimes } from "./api/episode";
import { db } from "./db";

ipcMain.handle("system:get-preferences", async (event) => {
  let preferences = await db.preferences.findUnique({
    where: {
      id: 0,
    },
  });
  console.log("Preferences:")
  console.log({ preferences });
  if (!preferences) {
    console.log("no preference found")
    preferences = {
      accentColor: "#caf2ff",
      id: 0,
    };
    await db.preferences.create({ data: preferences });
  }
  return preferences;
});

ipcMain.handle("system:set-preferences", async (event, update) => {
  await db.preferences.update({
    data: update,
    where: {
      id: 0,
    },
  });
});

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
  console.log("Found", results.length, "results for:", query);
  return results;
});

ipcMain.handle("anime:genre", async (event, genre: string) => {
  let result = [];
  return result;
});

ipcMain.handle("anime:recommendations", async (event, malId: number) => {
  let result = await getRecommendations(malId);
  return result;
});

ipcMain.handle("anime:related", async (event, kitsuId: string) => {
  let result = await getAllRelatedAnime(kitsuId, ["prequel", "sequel"]);
  return result;
});

ipcMain.handle("episode:info", async (event, kitsuId: number) => {
  let result = await episodes(kitsuId);
  return result;
});

ipcMain.handle(
  "episode:skip-times",
  async (event, kitsuId: number, episodeNum: number, episodeLength: number) => {
    let result = await getSkipTimes(kitsuId, episodeNum, episodeLength);
    return result;
  }
);

ipcMain.handle(
  "episode:get",
  async (event, kitsuId: number, episodeNum: number) => {
    let result = await getEpisode(kitsuId, episodeNum);
    return result;
  }
);

ipcMain.handle("cache:http-delete", async (event) => {
  await db.response.deleteMany({});
  return "ok";
});
