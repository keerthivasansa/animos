import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
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

// TODO add strong type support for electron files
const loadPath = serve({ directory: "output" });

console.log({ loadPath });

console.log("App version:" + app.getVersion());

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
  let update = await autoUpdater.checkForUpdates();
  return {
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

const createWindow = () => {
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

  win.maximize();

  if (isDev) {
    win.loadURL("http://localhost:5173/");
  } else {
    loadPath(win);
  }

  ipcMain.on("fullscreen", (event, makeFullscreen: boolean) => {
    win.setFullScreen(makeFullscreen);
  });

  win.show();
  win.focus();
  return win;
};

const appOrigin = ["http://localhost:5173", "null"];
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
  // webContent.session.webRequest.onHeadersReceived((details, cb) => {
  //   let responseHeaders = setAllowOrigin(
  //     details.responseHeaders,
  //     currentOrigin
  //   );

  //   cb({
  //     responseHeaders,
  //   });
  // });
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

app.whenReady().then(() => {
  app.setAppUserModelId("com.keerthivasan.animos");
  let tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open Last Watched Anime",
        click: () => {
          currentWindow.webContents;
        },
      },
    ])
  );
  tray.on("double-click", () => console.log("Open last watched anime"));

  if (currentWindow) {
    currentWindow.show();
    currentWindow.focus();
  } else {
    currentWindow = createWindow();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
