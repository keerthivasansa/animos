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
  async (event, animeId: number, episodeId: number) => {
    let doc = await prisma.episode.findUnique({
      where: {
        animeId_episodeId: {
          animeId,
          episodeId,
        },
      },
    })
    if (doc) return doc.watchTime
    else return 0
  },
)

ipcMain.handle('get-last-played', async (event) => {
  let docs = await prisma.episode.findMany({
    distinct: 'animeId',
    select: {
      anime: {
        select: {
          img: true,
          title: true,
        },
      },
      episodeId: true,
      watchTime: true,
    },
    orderBy: {
      lastWatched: 'desc',
    },
    where: {
      lastWatched: {
        not: null,
      },
    },
  })
  console.log(docs)
  return docs
})

ipcMain.handle('search-anime', async (event, keyw: string) => {
  let newDocs = await standardSearch(keyw)
  return newDocs
})

ipcMain.on(
  'set-watchtime',
  async (event, animeId: number, episodeId: number, time: number) => {
    console.log({ time })
    await prisma.episode.update({
      where: {
        animeId_episodeId: {
          animeId,
          episodeId,
        },
      },
      data: { lastWatched: new Date(), watchTime: time },
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
