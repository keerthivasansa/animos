import { fetchGogoanimeEpisodeSource } from './electron-src/scraper'

async function m() {
    console.time("episodefetch")
  let res = await fetchGogoanimeEpisodeSource({
    episodeId: 'death-note-episode-3',
  })
  console.log(res)
  console.timeEnd("episodefetch")
}
m()
