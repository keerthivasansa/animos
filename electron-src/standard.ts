import {
  fetchAnimixAnimeInfo,
  fetchGogoanimeEpisodeSource,
  fetchGogoAnimeInfo,
} from './scraper'

const express = require('express')
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

function selectFields(obj, fields) {
  let newobj = {}
  fields.forEach((k) => (newobj[k] = obj[k]))
  return newobj
}

export { fetchPopular as standardGetPopular } from "./scraper"

export async function standardSearch(keyword: string, nocache = false) {
  let docs = []
  console.log({ nocache, keyword })
  if (!nocache)
    docs = await prisma.anime.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { englishTitle: { contains: keyword } },
        ],
      },
      select: {
        animeId: true,
        malId: true,
        img: true,
        englishTitle: true,
        title: true,
      },
    })
  console.dir(docs)
  if (docs.length) {
    console.log('cache hit')
    return docs
  }
  let res = await axios.get(`https://api.jikan.moe/v4/anime?q=${keyword}&sfw`)
  let { data } = res.data
  let result = data.map((d) => {
    console.log(d)
    let data = {
      malId: d.mal_id,
      englishTitle: d.title_english ?? '',
      title: d.title ?? '',
      type: d.type ?? '',
      img: d.images.jpg.image_url ?? '',
      totalEpisodes: d.episodes ?? 0,
      score: d.score ?? 0,
      synopsis: d.synopsis ?? '',
      status: d.status ?? '',
      currentEp: 0,
    }
    return data
  })
  prisma.$transaction(
    result.map((data) => {
      return prisma.anime.upsert({
        where: { malId: data.malId },
        update: { currentEp: { increment: 0 } },
        create: data,
      })
    }),
  )
  return result.map((d) => selectFields(d, ['img', 'title', 'malId', 'score']))
}

export async function standardGetInfo(malId: number) {
  let doc = await prisma.anime.findUnique({
    where: { malId },
  })
  if (!doc) {
    return {}
  }
  if (!doc.animeId || !doc.totalEpisodes) {
    console.log('Missing one of the required fields')
    let doc2 = await fetchAnimixAnimeInfo({ malId })
    let { animeId, episodes } = doc2
    if (!episodes) {
      let info = await fetchGogoAnimeInfo({ animeId })
      episodes = info.eptotal
      console.log('got episode count from gogoanime: ', episodes)
    }
    doc = await prisma.anime.update({
      where: { malId },
      data: { animeId, totalEpisodes: parseInt(episodes) },
    })
    console.log(`Mapped animeId: ${animeId} to anime with malId: ${malId}`)
  }
  return doc
}

export async function standardGetEpisodeInfo(animeMalId, episodeNum) {
  let doc = await prisma.episode.findUnique({
    where: {
      animeId_episodeId: {
        animeId: parseInt(animeMalId),
        episodeId: parseInt(episodeNum),
      },
    },
  })
  if (doc && doc.synopsis) {
    console.log('cache hit for ', animeMalId, episodeNum)
    return doc
  }
  let res = await axios.get(
    `https://api.jikan.moe/v4/anime/${animeMalId}/episodes/${episodeNum}`,
  )
  let { data } = res.data
  doc = {
    episodeId: parseInt(data.mal_id),
    title: data.title,
    synopsis: data.synopsis,
    animeId: animeMalId,
    watched: 0,
  }
  await prisma.episode.upsert({
    where: {
      animeId_episodeId: {
        animeId: parseInt(animeMalId),
        episodeId: parseInt(episodeNum),
      },
    },
    create: doc,
    update: {},
  })
  return doc
}

export async function standardEpisodeSrc(animeMalId, episodeId) {
  console.log('Trying to fetch episode src:', animeMalId, episodeId)
  let doc = await standardGetEpisodeInfo(animeMalId, episodeId)
  if (doc && doc.source) {
    console.log('cache hit for', animeMalId, episodeId)
    return doc
  }
  let { animeId } = await prisma.anime.findUnique({
    where: {
      malId: animeMalId,
    },
  })
  let epUri = `${animeId}-episode-${episodeId}`
  console.log({ animeId, epUri })
  let gogoDoc = await fetchGogoanimeEpisodeSource({
    episodeId: epUri,
  })
  console.log(gogoDoc)
  if (!gogoDoc.sources) {
    throw new Error("Failed to get source for the given episode");
  }
  let source = {
    source: gogoDoc.sources[0].file,
    sourceBackup: gogoDoc.sources_bk[0].file,
  }
  console.log({ source })
  await prisma.episode.update({
    where: {
      animeId_episodeId: {
        animeId: animeMalId,
        episodeId,
      },
    },
    data: source, // add source fields to existing data
  })
  doc.source = source.source
  doc.sourceBackup = source.sourceBackup
  return doc
}

// TODO account for animes with episode zero like re:zero
export async function standardGetEpisodes(animeMalId) {
  let episodes = await prisma.episode.findMany({
    where: {
      animeId: parseInt(animeMalId),
    },
  })
  if (episodes.length > 1) return episodes
  let result = await axios.get(
    `https://api.jikan.moe/v4/anime/${animeMalId}/episodes`,
  )
  let { data } = result.data
  episodes = data.map((d) => {
    return {
      title: d.title,
      episodeId: parseInt(d.mal_id),
      animeId: animeMalId,
      watched: 0,
      // TODO add filler
    }
  })
  prisma.$transaction(
    episodes.map((ep) =>
      prisma.episode.upsert({
        where: {
          animeId_episodeId: {
            animeId: parseInt(animeMalId),
            episodeId: ep.episodeId,
          },
        },
        update: { watched: { increment: 0 } },
        create: ep,
      }),
    ),
  )
  return episodes
}

app.get('/', (req, res) => {
  res.send('Working!')
})

app.get('/episode/:anime/:episode/watch', async (req, res) => {
  let { anime, episode } = req.params
  let { animeId } = await prisma.anime.findUnique({
    where: { malId: parseInt(anime) },
    select: { animeId: true },
  })
  res.json(await standardEpisodeSrc(animeId, episode))
})

app.get('/episode/:anime/:episode/info', async (req, res) => {
  let { anime, episode } = req.params
  res.json(await standardGetEpisodeInfo(anime, episode))
})

app.get('/info/:malId', async (req, res) => {
  let { malId } = req.params
  res.json(await standardGetInfo(malId))
})

app.get('/search/:q', async (req, res) => {
  let { q } = req.params
  let { nocache } = req.query
  res.json(await standardSearch(q, nocache))
})

app.listen(4000, (_) => console.log('api started listening'))