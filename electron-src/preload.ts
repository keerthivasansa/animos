const { contextBridge, ipcRenderer } = require('electron')

const endpoints = {
  hello: (name: string, age: number) => ipcRenderer.send('hello', name, age),
  searchAnime: (keyw: string) => ipcRenderer.send('search-anime', keyw),
  search: (name: string) => ipcRenderer.invoke('search-anime', name),
  popularAnime: () => ipcRenderer.invoke('get-popular-anime'),
  getEpisode: (animeId: number, episodeId: number) =>
    ipcRenderer.invoke('get-episode', animeId, episodeId),
  animeInfo: (animeId: number) => ipcRenderer.invoke('get-anime-info', animeId),
  getEpisodes: (animeId: number) => ipcRenderer.invoke('get-episodes', animeId),
  fullscreen: (makeFullscreen: boolean) =>
    ipcRenderer.send('fullscreen', makeFullscreen),
  setWatchTime: (animeMalId: number, episodeId: number, time: number) =>
    ipcRenderer.invoke('set-watchtime', animeMalId, episodeId, time),
  getWatchTime: (animeId: number, episodeId: number) =>
    ipcRenderer.invoke('get-playtime', animeId, episodeId) as Promise<number>,
    setEpisodeLength: (animeId:number, episodeId:number, length:number) => ipcRenderer.send("episode:set-length", animeId, episodeId, length),
  getLastPlayed: () =>
    ipcRenderer.invoke('get-last-played') as Promise<
      {
        anime: { title: string; img: string }
        watchTime: number
        animeId: number, 
        length: number,
        episodeId: number
      }[]
    >,
  renewSource: (animeId: number, episodeId: number) =>
    ipcRenderer.invoke('renew-episode-source', animeId, episodeId) as Promise<{
      source: string
      sourceBackup: string
    }>,
}

export type EndpointType = typeof endpoints

contextBridge.exposeInMainWorld('api', endpoints)
