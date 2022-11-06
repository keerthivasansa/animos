import { ipcMain, dialog } from 'electron'
import {
  standardGetInfo,
  standardSearch,
  standardEpisodeSrc,
  standardGetEpisodes,
  standardGetPopular,
} from './standard'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    if (doc) return doc.watch
    else return 0
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
