import { ipcMain } from "electron";
import {
  getUserRecommendations,
  getInfo,
  getPosters,
  search,
  getPopular,
  getGenre,
  getGenreNames,
} from "./index";
import { Anime } from "@prisma/client";
import { db } from "../../db";

ipcMain.handle("anime:like", async (event, kitsuId: number, liked: boolean) => {
  let updates = await db.anime.update({
    where: {
      kitsuId,
    },
    data: {
      liked,
    },
  });
  console.log({ like: updates.liked, liked });
  return;
});

ipcMain.handle("anime:user-recommendations", async (event) => {
  let result = await getUserRecommendations();
  return result;
});

ipcMain.handle("anime:info", async (event, kitsuId: number) => {
  console.info("Cache fail, fetching info for", kitsuId);
  try {
    let info = await getInfo(kitsuId);
    return info;
  } catch (err) {
    console.log(err);
  }
});

ipcMain.handle("anime:posters", async (event) => {
  let res = (await getPosters()) as Anime[];
  return res;
});

ipcMain.handle(
  "anime:search",
  async (event, filters: Record<string, string>, page: number) => {
    let results = await search(filters, page);
    console.log("Found", results.data.length, "results for:", filters);
    return results;
  }
);

ipcMain.handle("anime:genre-names", async (event) => {
  let genreNames = await getGenreNames();
  return genreNames;
})

ipcMain.handle("anime:genre", async (event, genre: string, page: number) => {
  let result = getGenre(genre, page);
  return result;
});

ipcMain.handle("anime:popular", async (event, page: number) => {
  let result = await getPopular(page);
  return result;
});
