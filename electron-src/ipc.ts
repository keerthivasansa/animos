import { Anime } from "@prisma/client";
import { ipcMain } from "electron";
import { api } from "./api-v2";
import {
  getGenre,
  getPartialInfo,
  getPosters,
  getRecommendations,
} from "./api/anime";
import { episodes, getEpisode } from "./api/episode";
import { db } from "./db";

ipcMain.handle("anime:info", async (event, malId: number) => {
  let info = await db.anime.findUnique({
    where: {
      malId,
    },
  });
  if (info) return await getPartialInfo(info);
  console.log("Cache fail, fetching info for", malId);
  try {
    info = await api.anime.info(malId);
  } catch (err) {
    console.log(err);
  }
  await db.anime.create({
    data: info,
  });
  return info;
});

ipcMain.handle("anime:posters", async (event) => {
  let result = await db.anime.findMany({
    where: {
      poster: {
        gt: -1,
      },
      lastUpdated: {
        gt: new Date(Date.now() - 86400 * 1000 * 7),
      },
    },
  });
  if (result.length > 1) {
    console.log("cache hit");
    return result;
  }
  let res = (await getPosters()) as Anime[];
  await db.$transaction(
    res.map((anime, index) => {
      anime.poster = index;
      return db.anime.upsert({
        create: anime,
        update: {},
        where: {
          kitsuId: anime.kitsuId,
        },
      });
    })
  );
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
