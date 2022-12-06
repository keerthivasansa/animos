import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  session,
  Tray,
} from "electron";
import serve from "electron-serve";
import { join } from "path";
import { config } from "dotenv";
import { autoUpdater } from "electron-updater";

config();

console.info("Starting app . . .");

// register url for prisma
process.env.DATABASE_URL = "file:./cache.db";

// register all the ipc functions
import "./ipc";
import { db } from "./db";
import { logger } from "./utils";

// TODO add strong type support for electron files
const loadPath = serve({ directory: "output" });

logger.level = "INFO";

logger.info("Starting app", {
  version: app.getVersion(),
});

autoUpdater.setFeedURL({
  provider: "github",
  repo: "animos",
  owner: "Nectres",
});
autoUpdater.forceDevUpdateConfig = true;

autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("system:get-updates", async (event) => {
  console.log(
    "Checking for updates, current app version:",
    autoUpdater.currentVersion
  );
  let update = await autoUpdater.checkForUpdates();
  return {
    available: update.updateInfo.version != app.getVersion(),
    version: update.updateInfo.version,
    releaseNotes: update.updateInfo.releaseNotes,
  };
});

ipcMain.handle("system:download-update", () => {
  autoUpdater.downloadUpdate();
});

app.enableSandbox();

const isDev = !app.isPackaged;

let currentWindow: BrowserWindow;
const iconPath = join(__dirname, "../build/icons/favicon.ico");

let appTray: Tray;

async function createWindow() {
  let preloadPath = join(__dirname, "../dist/preload.js");
  console.log({ preloadPath, iconPath });
  const win = new BrowserWindow({
    title: "animos",
    icon: iconPath,
    titleBarStyle: "customButtonsOnHover",
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      disableBlinkFeatures: "Auxclick",
      nodeIntegration: false,
      webSecurity: true,
      preload: preloadPath,
    },
    show: false,
    frame: true,
    autoHideMenuBar: true,
  });

  let webContents = win.webContents;

  webContents.send("download-progress", 93);

  webContents.on("did-finish-load", () => {
    webContents.setZoomFactor(1);
  });

  autoUpdater.on("download-progress", (info) => {
    win.webContents.send("download-progress", info.percent);
  });

  if (isDev) {
    await win.loadURL("http://localhost:5173/");
  } else {
    await loadPath(win);
  }

  ipcMain.on("fullscreen", (event, makeFullscreen: boolean) => {
    win.setFullScreen(makeFullscreen);
  });

  win.show();
  win.focus();
  return win;
}
const currentOrigin = isDev ? "http://localhost:5173" : "null";

// Checks for allow-origin header, if it is present with wildcard, returns it otherwise sets the origin of the application as the header value.
function setAllowOrigin(
  headers: Record<string, string[]>,
  origin: string
): Record<string, string[]> {
  let originHeaders = [
    "access-control-allow-origin",
    "Access-Control-Allow-Origin",
  ];
  for (let header of originHeaders) {
    if (Object.keys(headers).includes(header)) {
      if (headers[header].length == 1 && headers[header][0] == "*")
        return headers;
      else {
        headers[header] = [origin];
        return headers;
      }
    } else {
      return headers;
    }
  }
}

const allowedPermissions = ["notifications", "fullscreen"];

app.on("web-contents-created", (event, webContent) => {
  webContent.session.webRequest.onHeadersReceived((details, cb) => {
    let responseHeaders = setAllowOrigin(
      details.responseHeaders,
      currentOrigin
    );

    cb({
      responseHeaders,
    });
  });
  session.defaultSession.setPermissionRequestHandler(
    (webContent, permission, cb) => {
      // deny all permissions.
      const url = webContent.getURL();
      console.log(url, "is requesting", permission);
      if (allowedPermissions.includes(permission)) cb(true);
      else cb(false);
    }
  );
});

async function getWindow(): Promise<BrowserWindow> {
  if (currentWindow) return currentWindow;
  currentWindow = await createWindow();
  return new Promise((res, rej) => {
    currentWindow.on("ready-to-show", () => res(currentWindow));
  });
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.keerthivasan.animos");
  appTray = new Tray(nativeImage.createFromPath(iconPath));
  appTray.setContextMenu(
    Menu.buildFromTemplate([
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
    ])
  );
  appTray.on("double-click", () => console.log("Open last watched anime"));
  if (currentWindow) {
    currentWindow.show();
    currentWindow.focus();
  } else {
    currentWindow = await createWindow();
  }
});

// prevent quitting the app on window close
app.on("window-all-closed", (e) => {
  e.preventDefault();
  currentWindow = null;
});
