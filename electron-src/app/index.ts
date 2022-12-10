import { app, BrowserWindow, session, Tray } from "electron";
import serve from "electron-serve";
import { join } from "path";
import { config } from "dotenv";
import { migratePrisma, needsMigration } from "../db/utils";
import { trayMenu } from "./tray";
import { logger } from "../utils";

config();

const singleInstanceLock = app.requestSingleInstanceLock();
console.log("First instance:", singleInstanceLock);

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

export const rootPath = isDev ? "" : process.resourcesPath;

console.log(__dirname);
const iconPath = join(rootPath, "build/icons/windows.png");

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
    frame: false,
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
      cb(allowedPermissions.includes(permission));
    }
  );
});

export async function getWindow(): Promise<BrowserWindow> {
  if (currentWindow) {
    currentWindow.show();
    return currentWindow;
  }
  currentWindow = await createWindow();
  return new Promise((res, rej) => {
    currentWindow.on("ready-to-show", () => res(currentWindow));
  });
}

if (!singleInstanceLock) {
  console.log("Preventing launch of another instance");
  app.quit();
} else {
  app.on("ready", startApp);
  app.on("second-instance", async (event, args, workingDirectory, data) => {
    console.log("Second instance launch detected, restoring current window");
    getWindow();
  });
}

async function startApp() {
  app.setAppUserModelId("com.keerthivasan.animos");
  appTray = new Tray(iconPath);
  appTray.setContextMenu(trayMenu);
  currentWindow = await getWindow();
  appTray.on("double-click", getWindow);
}

// prevent quitting the app on window close
app.on("window-all-closed", (e) => {
  e.preventDefault();
  currentWindow = null;
});
