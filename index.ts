import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'
import { join } from 'path'

// register url for prisma
process.env.DATABASE_URL = 'file:./cache.db'

// register all the ipc functions
import './electron-src/ipc'

// TODO add strong type support for electron files
const loadPath = serve({ directory: 'output' })

console.log({ loadPath })

app.enableSandbox()

// disable cors checking 
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const isDev = !app.isPackaged

let currentWindow: BrowserWindow

const createWindow = () => {
  let preloadPath = join(__dirname, '/electron-src/preload.js')
  console.log({ preloadPath })
  const win = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '/electron-src/preload.js'),
    },
    show: false,
    autoHideMenuBar: true,
  })

  let webContents = win.webContents

  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1)
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
  return win
}

app.whenReady().then(() => {
  if (currentWindow) {
    currentWindow.show()
    currentWindow.focus()
  } else {
    currentWindow = createWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
