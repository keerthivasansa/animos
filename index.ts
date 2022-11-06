import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'

// TODO add strong type support for electron files
const loadPath = serve({ directory: 'output' })

app.commandLine.appendSwitch('disable-pinch')

const isDev = !app.isPackaged

const createWindow = () => {
  let preloadPath = __dirname + '/electron-src/preload.js'
  console.log({ preloadPath })
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + '/electron-src/preload.js',
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
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
