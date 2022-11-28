import { app, BrowserWindow, ipcMain, session } from "electron";
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

autoUpdater.checkForUpdatesAndNotify();
app.enableSandbox();

const isDev = !app.isPackaged;

let currentWindow: BrowserWindow;

const createWindow = () => {
  let iconPath = join(__dirname, "../build/icons/favicon.ico");
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

  webContents.on("did-finish-load", () => {
    webContents.setZoomFactor(1);
  });

  win.webContents;

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
const appOriginString = appOrigin.join(",");

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
    }
  }
}

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
      if (permission == "fullscreen") cb(true);
      else cb(false);
    }
  );
  webContent.on("will-navigate", (event, url) => {
    const parsedUrl = new URL(url);
    // if the url is not within allowedOrigin, prevent navigating to it.
    if (!appOrigin.includes(parsedUrl.origin) && parsedUrl.protocol != "app:") {
      console.log(
        "Unknown origin navigation detected. Origin: ",
        parsedUrl.origin
      );
      console.log(parsedUrl);
      event.preventDefault();
    }
  });
});

app.whenReady().then(() => {
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
