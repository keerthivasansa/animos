import { ipcMain, dialog, app } from 'electron'
import {
  standardGetInfo,
  standardSearch,
  standardEpisodeSrc,
  standardGetEpisodes,
  standardGetPopular,
  renewEpisodeSource,
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

ipcMain.on('episode:set-length', async (event, animeId, episodeId, length) => {
  await prisma.episode.update({
    where: {
      animeId_episodeId: {
        animeId,
        episodeId,
      },
    },
    data: {
      length: parseInt(length),
    },
  })
})

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
      length: true,
      animeId: true,
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
  return docs
})

ipcMain.handle('search-anime', async (event, keyw: string) => {
  let newDocs = await standardSearch(keyw)
  return newDocs
})

async function savePlayback(animeId: number, episodeId: number, time: number) {
  await prisma.episode.update({
    where: {
      animeId_episodeId: {
        animeId,
        episodeId,
      },
    },
    data: { lastWatched: new Date(), watchTime: time },
  })
  return 'okay'
}

ipcMain.handle(
  'set-watchtime',
  async (event, animeId: number, episodeId: number, time: number) => {
    await savePlayback(animeId, episodeId, time)
    return
  },
)

ipcMain.handle('get-anime-info', async (event, animeId: number) => {
  console.log(`Searching for anime: ${animeId}`)
  let animeInfo = await standardGetInfo(animeId)
  return animeInfo
})

ipcMain.handle('get-episodes', async (event, animeId: number) => {
  console.log(`Fetching episodes for ${animeId}`)
  let episodes = await standardGetEpisodes(animeId)
  return episodes
})

ipcMain.handle('get-popular-anime', async (event) => {
  let popularAnime = await standardGetPopular({})
  return popularAnime
})

ipcMain.handle(
  'get-episode',
  async (event, animeId: number, episodeId: number) => {
    let docs = await standardEpisodeSrc(animeId, episodeId)
    return docs
  },
)

ipcMain.on('message', (event, msg) => {
  console.log(msg)
})

ipcMain.handle(
  'renew-episode-source',
  async (event, animeId: number, episodeId: number) => {
    console.log(
      'Episode source for ',
      animeId,
      episodeId,
      ' has been reported to be expired. Renewing sources . . .',
    )
    let source = await renewEpisodeSource(animeId, episodeId)
    return source
  },
)

ipcMain.on('hello', (event, name: string, age: number) => {
  console.log(event)
  dialog.showMessageBox({
    message: `Hello ${name}! you are ${age} years old.`,
  })
})
