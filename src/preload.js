const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  hello: (name, age) => ipcRenderer.send("hello", name, age),
  searchAnime: (keyw) => ipcRenderer.send("search-anime", keyw),
  search: (name) => ipcRenderer.invoke("search-anime", name),
  popularAnime: () => ipcRenderer.invoke("get-popular-anime"),
  getEpisode: (animeId, episodeId) => ipcRenderer.invoke("get-episode", animeId, episodeId),
  animeInfo: (animeId) => ipcRenderer.invoke("get-anime-info", animeId),
  getEpisodes: (animeId) => ipcRenderer.invoke("get-episodes", animeId),
  fullscreen: (makeFullscreen) => ipcRenderer.send("fullscreen", makeFullscreen)
});
