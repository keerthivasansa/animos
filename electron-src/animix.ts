import axios from 'axios'
import { load } from 'cheerio'
import { XMLParser } from 'fast-xml-parser'

const animixBase = 'https://animixplay.to/'
// const animixSearchApi = "https://cachecow.eu/api/search";  NOT CURRENTLY USED.
const animixSearchApi2 = 'https://v1.ij7p9towl8uj4qafsopjtrjk.workers.dev/'
const animixAll = 'https://animixplay.to/assets/s/all.json'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
const headerOption = { headers: { 'User-Agent': USER_AGENT } }

// Importing helper functions
import { encodeString, decodeStreamingLinkAnimix } from './helper'

export const fetchSearchAnimix = async ({
  list = [],
  keyw,
}: {
  list?: {
    animeTitle?: string
    animeId?: string
    animeImg?: string
  }[]
  keyw: string
}) => {
  try {
    if (!keyw)
      return {
        error: true,
        error_message: 'No keyword provided',
      }
    const fetchAnimix = await axios.request({
      url: animixSearchApi2,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      data: new URLSearchParams({ q2: keyw }),
    })

    const $ = load(fetchAnimix.data.result)
    $('li').each((index, element) => {
      list.push({
        animeTitle: $(element).find('div > a').attr('title'),
        animeId: $(element).find('div > a').attr('href')?.split('/v1/')[1],
        animeImg: $(element).find('.resultimg').attr('src'),
      })
    })

    return list
  } catch (err) {
    console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}

export const fetchAnimixRecentEpisodes = async ({ list = [] }:{
    list: { episodeTitle: any; animeId: any; releaseTimeUnix: number; mal_id: any; episodeNum: any; episodes: any; animeImg: string | undefined; }[]
}) => {
  try {
    const res = await axios.get(animixBase + 'rsssub.xml')
    const parser = new XMLParser()
    const jsonResults = parser.parse(res.data).rss.channel.item

    jsonResults.map((anime) => {
      const $ = load(anime.description)
      list.push({
        episodeTitle: anime.title.split(' ').slice(0, -2).join(' '),
        animeId: anime.link.split('/')[4],
        releaseTimeUnix: Date.parse(anime.pubDate) / 1000,
        mal_id: anime.idmal,
        episodeNum: anime.ep.split('/')[0],
        episodes: anime.ep,
        animeImg: $('img').attr('src'),
      })
    })

    return list
  } catch (err) {
    console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}

export const fetchAnimixAllAnime = async ({ list = [] }:{
    list:{ animeTitle: any; animeId: any; }[]
}) => {
  try {
    const fetchAnimixAll = await axios.get(animixAll, headerOption)
    fetchAnimixAll.data.map((anime) => {
      list.push({
        animeTitle: anime.title,
        animeId: anime.id,
      })
    })

    return list
  } catch (err) {
    console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}

export const fetchAnimixAnimeInfo = async ({ malId, list = {} }) => {
  try {
    if (!malId)
      return {
        error: 'No ID provided',
      }

    const fetchInfo = await axios.get(
      animixBase + `assets/mal/${malId}.json`,
      headerOption,
    )
    const fetchInfoLinks = await axios
      .get(animixBase + `assets/rec/${malId}.json`, headerOption)
      .catch((err) => {})

    if (!fetchInfoLinks)
        return;
    list = {
      animeTitle: fetchInfo.data.title,
      animeId: fetchInfoLinks?.data['Gogoanime']
        ? fetchInfoLinks?.data['Gogoanime'][0].url.split('/').reverse()[0]
        : '',
      mal_id: fetchInfo.data.mal_id,
      animeImg: fetchInfo.data.image_url,
      episodes: fetchInfo.data.episodes,
      status: fetchInfo.data.status,
      score: fetchInfo.data.score,
      synopsis: fetchInfo.data.synopsis,
      genres: fetchInfo.data.genres.map((genr) => genr.name),
      studios: fetchInfo.data.studios.map((st) => st.name),
      gogoAnimeLink: fetchInfoLinks?.data['Gogoanime'],
      animepaheLink: fetchInfoLinks?.data['animepahe'],
      zoroLink: fetchInfoLinks?.data['Zoro'],
    }

    return list
  } catch (err) {
    console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}

export const fetchAnimixEpisodeInfo = async ({ animeId, list = {} }) => {
  try {
    if (!animeId) {
      return {
        error: 'No anime ID provided',
      }
    }

    const res = await axios.get(animixBase + `v1/${animeId}`, headerOption)
    let episodes: {
      epNum: number
      link: string
    }[] = []
    const $ = load(res.data)

    const epList = JSON.parse($('#epslistplace').text())

    for (var key in epList) {
      if (Number(key) + 1) {
        episodes.push({
          epNum: Number(key) + 1,
          link: epList[key],
        })
      }
    }

    list = {
      animeTitle: $('span.animetitle').text(),
      mal_id:( $('body > script')
        .get()[0]
        .children[0] as any).data.match(/var malid = '(.*)';/)[1],
      genres: $('span#genredata').text(),
      status: $('span#status').text(),
      total_episodes: epList.eptotal,
      extraLinks: epList?.extra,
      episodes,
    }

    return list
  } catch (err) {
    console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}

export const fetchAnimixEpisodeSource = async ({ episodeId }) => {
  try {
    let sources = []
    let sources_bk = []
    let type
    let episodeGogoLink

    if (!episodeId)
      return {
        error: 'No episode ID provided',
      }
    const animeId = episodeId.split('-').reverse().splice(2).reverse().join('-')
    const episodeNum = episodeId.split('-').splice(-1).join('')

    const res = await axios.get(animixBase + `v1/${animeId}`, headerOption)
    const $ = load(res.data)
    const epList = JSON.parse($('#epslistplace').text())

    if (epList.extra) {
      if (episodeNum in epList.extra) {
        episodeGogoLink = new URL('https:' + epList.extra[episodeNum])
      } else {
        episodeGogoLink = new URL('https:' + epList[episodeNum - 1])
      }
    } else {
      episodeGogoLink = new URL('https:' + epList[episodeNum - 1])
    }

    let liveApiLink

    //Checking if the episode source link is already a Plyr link or not
    if (episodeGogoLink.href.includes('player.html')) {
      liveApiLink = episodeGogoLink.href
    } else {
      const content_id = episodeGogoLink.searchParams.get('id')
      liveApiLink =
        'https://animixplay.to/api/cW9' +
        encodeString(`${content_id}LTXs3GrU8we9O${encodeString(content_id)}`)
    }

    const src = await decodeStreamingLinkAnimix(liveApiLink)

    if (src.includes('player.html')) {
      type = 'plyr'
    } else if (src.includes('.m3u8')) {
      type = 'hls'
    } else if (src.includes('.mp4')) {
      type = 'mp4'
    }

    return {
      animeId,
      episodeNum,
      sources: src,
    }
  } catch (err) {
    // console.log(err)
    return {
      error: true,
      error_message: err,
    }
  }
}
