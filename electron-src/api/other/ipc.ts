import { ipcMain } from "electron";
import { currentWindow } from "../../app";
import { db } from "../../db";
import { WindowState } from "../../types";
import { updateRPC } from "../../app/discord"

ipcMain.handle("system:get-preferences", async (event) => {
  let preferences = await db.preferences.findUnique({
    where: {
      id: 0,
    },
  });
  console.log("Preferences:");
  console.log({ preferences });
  if (!preferences) {
    console.log("no preference found");
    preferences = {
      accentColor: "#caf2ff",
      id: 0,
      genres: "",
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

ipcMain.handle("cache:http-delete", async (event) => {
  await db.response.deleteMany({});
  return "ok";
});

ipcMain.on("fullscreen", (event, makeFullscreen: boolean) => {
  currentWindow?.setFullScreen(makeFullscreen);
});

ipcMain.on("system:window", (event, type: WindowState) => {
  switch (type) {
    case "maximize":
      currentWindow.maximize();
      break;
    case "minimize":
      currentWindow.minimize();
      break;
    case "close":
      currentWindow.close();
      break;
  }
});

ipcMain.on("system:rpc", (event, sub1: string, sub2:string) => {
  updateRPC(sub1, sub2)
})
