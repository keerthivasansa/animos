import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'
import { join } from 'path'
import corsProxy from 'cors-anywhere'


const host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable


process.env.DATABASE_URL = 'file:./cache.db'

// register all the ipc functions
import './electron-src/ipc'

// TODO add strong type support for electron files
const loadPath = serve({ directory: 'output' })

console.log({ loadPath })

app.commandLine.appendSwitch('disable-pinch')

const isDev = !app.isPackaged

function UpsertKeyValue(obj, keyToChange, value) {
  const keyToChangeLower = keyToChange.toLowerCase()
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value
      // Done
      return
    }
  }
  // Insert at end instead
  obj[keyToChange] = value
}

const createWindow = () => {
  let preloadPath = join(__dirname, '/electron-src/preload.js')
  console.log({ preloadPath })
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, '/electron-src/preload.js'),
    },
    show: false,
    autoHideMenuBar: true,
  })

  let webContents = win.webContents

  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1)
  })

  webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders } = details
    UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])
    callback({ requestHeaders })
  })

  webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])
    callback({
      responseHeaders,
    })
  })

  win.maximize()

  if (isDev) {
    win.loadURL('http://localhost:5173/')
  } else {
    loadPath(win)
  }

  ipcMain.on('fullscreen', (event, makeFullscreen: boolean) => {
    win.setFullScreen(makeFullscreen)
  })
  win.show()
  win.focus()
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
