import { app, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { currentWindow } from "./index";

autoUpdater.setFeedURL({
  provider: "github",
  repo: "animos",
  owner: "Nectres",
});

autoUpdater.forceDevUpdateConfig = true;

ipcMain.handle("system:install-update", async (event) => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("system:get-updates", async (event) => {
  console.log(
    "Checking for updates, current app version:",
    autoUpdater.currentVersion
  );
  let update = await autoUpdater.checkForUpdates();

  if (!update) {
    return {
      available: false,
      version: "",
      releaseNotes: "",
    };
  }

  return {
    available: update.updateInfo.version != app.getVersion(),
    version: update.updateInfo.version,
    releaseNotes: update.updateInfo.releaseNotes,
  };
});

autoUpdater.on("download-progress", (info) => {
  currentWindow.webContents.send("download-progress", info.percent);
});

ipcMain.handle("system:download-update", () => {
  autoUpdater.downloadUpdate();
});
