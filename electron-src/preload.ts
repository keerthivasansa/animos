import { contextBridge, ipcRenderer } from "electron";
import type { Anime } from "@prisma/client";

const endpoints = {
  anime: {
    info: (kitsuId: number) =>
      ipcRenderer.invoke("anime:info", kitsuId) as Promise<Anime>,
    search: (query: string) =>
      ipcRenderer.invoke("anime:search", query) as Promise<Anime[]>,
    posters: () => ipcRenderer.invoke("anime:posters") as Promise<Anime[]>,
    genre: (name: string) =>
      ipcRenderer.invoke("anime:genre", name) as Promise<Anime[]>,
    recommendations: (kitsuId: number) =>
      ipcRenderer.invoke("anime:recommendations", kitsuId) as Promise<Anime[]>,
    related: (kitsuId: number) => ipcRenderer.invoke("anime:related", kitsuId),
  },
  episode: {
    info: (kitsuId: number) => ipcRenderer.invoke("episode:info", kitsuId),
    get: (kitsuId: number, episodeNum: number) =>
      ipcRenderer.invoke("episode:get", kitsuId, episodeNum),
    getSkipTimes: (
      kitsuId: number,
      episodeNum: number,
      episodeLength: number
    ) =>
      ipcRenderer.invoke(
        "episode:skip-times",
        kitsuId,
        episodeNum,
        episodeLength
      ),
  },
  cache: {
    httpDelete: () => ipcRenderer.invoke("cache:http-delete"),
  },
};

export type EndpointType = typeof endpoints;

contextBridge.exposeInMainWorld("api", endpoints);
