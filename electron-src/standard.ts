import { Episode } from '@prisma/client'
import { fetchGogoanimeEpisodeSource, fetchGogoAnimeInfo } from './scraper'
import { fetchAnimixEpisodeSource, fetchAnimixAnimeInfo } from './animix'
import express from 'express'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

function selectFields(obj, fields) {
  let newobj = {}
  fields.forEach((k) => (newobj[k] = obj[k]))
  return newobj
}

export { fetchPopular as standardGetPopular } from './scraper'

export async function standardSearch(keyword: string, nocache = false) {
  let docs = []
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
  // TODO switch to animix search
  let res = await axios.get(`https://api.jikan.moe/v4/anime?q=${keyword}&sfw`)
  let { data } = res.data
  let result = data.map((d) => {
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
    let doc2 = (await fetchAnimixAnimeInfo({ malId })) as any
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

export async function standardGetEpisodeInfo(
  animeMalId: number,
  episodeNum: number,
): Promise<Episode> {
  let doc = await prisma.episode.findUnique({
    where: {
      animeId_episodeId: {
        animeId: animeMalId,
        episodeId: episodeNum,
      },
    },
  })
  if (doc && doc.synopsis) {
    console.log('cache hit for ', animeMalId, episodeNum)
    return doc
  }
  // TODO jikan moe often times out
  let res = await axios.get(
    `https://api.jikan.moe/v4/anime/${animeMalId}/episodes/${episodeNum}`,
  )
  let { data } = res.data
  doc = await prisma.episode.upsert({
    where: {
      animeId_episodeId: {
        animeId: animeMalId,
        episodeId: episodeNum,
      },
    },
    create: {
      episodeId: parseInt(data.mal_id),
      title: data.title,
      synopsis: data.synopsis,
      animeId: animeMalId,
      watchTime: 0,
    },
    update: {},
  })
  return doc
}

// TODO the source process is very slow, optimise it.

export async function renewEpisodeSource(
  animeMalId: number,
  episodeId: number,
): Promise<{ source: string; sourceBackup: string }> {
  let { animeId } = await prisma.anime.findUnique({
    where: {
      malId: animeMalId,
    },
  })
  let result = await fetchAnimixEpisodeSource({
    episodeId: `${animeId}-episode-${episodeId}`,
  })
  console.log(result)
  let source = {
    source: result.sources,
    sourceBackup: '',
    linkFetchedOn: new Date(),
  }
  await prisma.episode.update({
    where: {
      animeId_episodeId: {
        animeId: animeMalId,
        episodeId,
      },
    },
    data: source, // add source fields to existing data
  })
  return source
}

export async function standardEpisodeSrc(
  animeMalId: number,
  episodeId: number,
): Promise<Episode> {
  console.log('Trying to fetch episode src:', animeMalId, episodeId)
  let prevDay = new Date(Date.now() - 86400 * 1000)
  let doc = await standardGetEpisodeInfo(animeMalId, episodeId)
  if (doc && doc.source && doc.linkFetchedOn > prevDay) {
    console.log('cache hit for', animeMalId, episodeId)
    return doc
  } else {
    console.log('Searching for links . . . ')
  }
  let { animeId } = await prisma.anime.findUnique({
    where: {
      malId: animeMalId,
    },
  })
  let epUri = `${animeId}-episode-${episodeId}`
  console.log({ animeId, epUri })
  let gogoDoc = await fetchAnimixEpisodeSource({
    episodeId: `${animeId}-episode-${episodeId}`,
  })
  console.log(gogoDoc);
  if (!gogoDoc) {
    throw new Error('Failed to get source for the given episode')
  }
  let source = {
    source: gogoDoc.sources,
    sourceBackup: '',
    linkFetchedOn: new Date(),
  }
  await prisma.episode.update({
    where: {
      animeId_episodeId: {
        animeId: animeMalId,
        episodeId,
      },
    },
    data: source, // add source fields to existing data
  })
  doc = { ...doc, ...source }
  return doc
}

function sleep(ms: number) {
  return new Promise((res, rej) => {
    setTimeout(res, ms)
  })
}

// TODO account for animes with episode zero like re:zero
export async function standardGetEpisodes(animeMalId: number) {
  let episodes: Episode[] = await prisma.episode.findMany({
    where: {
      animeId: animeMalId,
    },
  })
  if (episodes.length > 1) return episodes
  let result = await axios.get(
    `https://api.jikan.moe/v4/anime/${animeMalId}/episodes`,
  )
  // sleep to prevent hitting rate limit in jikan moe api
  await sleep(1200)
  let { data } = result.data
  episodes = data.map((d) => {
    return {
      title: d.title,
      episodeId: parseInt(d.mal_id),
      animeId: animeMalId,
      watchTime: 0,
      // TODO add filler
    }
  })
  prisma.$transaction(
    episodes.map((ep) =>
      prisma.episode.upsert({
        where: {
          animeId_episodeId: {
            animeId: animeMalId,
            episodeId: ep.episodeId,
          },
        },
        update: { watchTime: { increment: 0 } },
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
  res.json(await standardEpisodeSrc(parseInt(animeId), episode))
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
