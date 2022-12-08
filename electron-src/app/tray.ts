import { app, Menu } from "electron";
import { getWindow } from ".";
import { db } from "../db";

export const trayMenu = Menu.buildFromTemplate([
  {
    label: "Open Last Watched Anime",
    click: async () => {
      let window = await getWindow();
      let episode = await db.episode.findFirst({
        where: {
          length: {
            not: null,
          },
          watchTime: {
            gt: 0,
          },
        },
        select: {
          number: true,
          anime: {
            select: {
              kitsuId: true,
              title: true,
              episodes: true,
              zeroEpisode: true,
            },
          },
        },
        orderBy: {
          lastUpdated: "desc",
        },
      });
      if (!episode) return;
      console.log("Last watched anime was:", episode.anime.title);
      let url = new URL(window.webContents.getURL());
      console.log(url);
      let origin = url.origin == "null" ? "app://-" : url.origin;
      let finalUrl =
        origin +
        `/episode?animeId=${episode.anime.kitsuId}&episodeId=${episode.number}&totalEpisode=${episode.anime.episodes}&zeroEp=${episode.anime.zeroEpisode}`;
      console.log({ finalUrl });
      window.webContents.loadURL(finalUrl);
    },
  },
  {
    label: "Quit",
    click: app.quit,
  },
]);
