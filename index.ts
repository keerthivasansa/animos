import { PrismaClient } from '@prisma/client'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import serve from 'electron-serve'
import {
  standardGetInfo,
  standardSearch,
  standardEpisodeSrc,
  standardGetEpisodes,
  standardGetPopular,
} from './electron-src/standard'

// TODO add strong type support for electron files
const loadPath = serve({ directory: 'output' })

app.commandLine.appendSwitch('disable-pinch')

const isDev = !app.isPackaged

const prisma = new PrismaClient()

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

ipcMain.handle(
  'get-playtime',
  async (event, animeMalId: number, episodeId: number) => {
    let doc = await prisma.playing.findUnique({
      where: {
        animeMalId_episodeId: {
          animeMalId,
          episodeId,
        },
      },
    })
    if (doc)
      return doc.watch;
    else 
      return 0;
  },
)
ipcMain.handle('search-anime', async (event, keyw: string) => {
  let newDocs = await standardSearch(keyw)
  return newDocs
})

ipcMain.on(
  'set-watchtime',
  async (event, animeMalId: number, episodeId: number, time: number) => {
    console.log({ time })
    await prisma.playing.upsert({
      where: {
        animeMalId_episodeId: {
          animeMalId,
          episodeId,
        },
      },
      create: {
        animeMalId,
        episodeId,
        watch: time,
        lastWatched: new Date(),
      },
      update: { lastWatched: new Date(), watch: time },
    })
  },
)

ipcMain.handle('get-anime-info', async (event, animeId: number) => {
  console.log(`Searching for anime: ${animeId}`)
  let animeInfo = await standardGetInfo(animeId)
  console.log(animeInfo)
  return animeInfo
})

ipcMain.handle('get-episodes', async (event, animeId: number) => {
  console.log(`Fetching episodes for ${animeId}`)
  let episodes = await standardGetEpisodes(animeId)
  console.dir(episodes)
  return episodes
})

ipcMain.handle('get-popular-anime', async (event) => {
  let popularAnime = await standardGetPopular({})
  console.dir(popularAnime)
  return popularAnime
})

ipcMain.handle(
  'get-episode',
  async (event, animeId: number, episodeId: number) => {
    let docs = await standardEpisodeSrc(animeId, episodeId)
    console.log(docs)
    return docs
  },
)

ipcMain.on('hello', (event, name: string, age: number) => {
  console.log(event)
  dialog.showMessageBox({
    message: `Hello ${name}! you are ${age} years old.`,
  })
})

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
