import { app, BrowserWindow, session, Tray } from "electron";
import serve from "electron-serve";
import { join } from "path";
import { config } from "dotenv";
import { migratePrisma, needsMigration } from "../db/utils";
import { trayMenu } from "./tray";
import { logger } from "../utils";

config();

console.info("Starting app . . .");

// register all the ipc functions
import "../api";
import "./update";

const loadPath = serve({ directory: "output" });

logger.level = "INFO";

logger.info("Starting app", {
  version: app.getVersion(),
});

app.enableSandbox();

export const isDev = !app.isPackaged;

export let currentWindow: BrowserWindow;
const iconPath = join(__dirname, "../../build/icons/favicon.ico");

let appTray: Tray;

async function createWindow() {
  let preloadPath = join(__dirname, "./preload.js");

  let needToMigrate = await needsMigration();
  if (needToMigrate) {
    console.log("Running migrate prisma command");
    await migratePrisma();
  }

  const window = new BrowserWindow({
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

  let webContents = window.webContents;

  webContents.on("did-finish-load", () => {
    webContents.setZoomFactor(1);
  });

  if (isDev) {
    await window.loadURL("http://localhost:5173/");
  } else {
    await loadPath(window);
  }

  window.show();
  window.focus();
  currentWindow = window;
  return window;
}

const allowedPermissions = ["notifications", "fullscreen"];

app.on("web-contents-created", (event, webContent) => {
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

export async function getWindow(): Promise<BrowserWindow> {
  if (currentWindow) return currentWindow;
  currentWindow = await createWindow();
  return new Promise((res, rej) => {
    currentWindow.on("ready-to-show", () => res(currentWindow));
  });
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.keerthivasan.animos");
  appTray = new Tray(iconPath);
  appTray.setContextMenu(trayMenu);
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
