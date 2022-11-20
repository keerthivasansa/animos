import { Episode } from '@prisma/client'
import { fetchGogoAnimeInfo } from './scraper.js'
import { fetchAnimixEpisodeSource, fetchAnimixAnimeInfo } from './animix'
import axios from 'axios'
import { prisma } from './db'

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
    // from search, create the entire document
    let animixInfo = (await fetchAnimixAnimeInfo({ malId })) as any
    console.log({ malId, animixInfo })
    doc = await prisma.anime.create({
      data: {
        animeId: animixInfo.animeId,
        malId: parseInt(animixInfo.mal_id),
        img: animixInfo.animeImg,
        totalEpisodes: animixInfo.episodes ?? 0,
        currentEp: 0,
        englishTitle: '',
        score: animixInfo.score,
        status: animixInfo.status,
        synopsis: animixInfo.synopsis,
        title: animixInfo.animeTitle,
        type: '',
      },
    })
  }
  if (!doc.animeId || !doc.totalEpisodes) {
    console.log('Missing one of the required fields')
    let animeid = doc.animeId
    if (!animeid) {
      let animixInfo = (await fetchAnimixAnimeInfo({ malId })) as any
      doc.animeId = animixInfo.animeId
      doc.totalEpisodes = animixInfo.episodes
    }
    if (!doc.totalEpisodes) {
      let info = await fetchGogoAnimeInfo({ animeId: doc.animeId })
      doc.totalEpisodes = parseInt(info.eptotal)
      console.log('got episode count from gogoanime: ', doc.totalEpisodes)
    }
    doc = await prisma.anime.update({
      where: { malId },
      data: { animeId: doc.animeId, totalEpisodes: doc.totalEpisodes },
    })
    console.log(
      `Mapped animeId: ${doc.animeId} to anime with malId: ${doc.malId}`,
    )
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
  console.log(gogoDoc)
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