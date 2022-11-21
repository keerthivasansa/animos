import { contextBridge, ipcRenderer } from "electron";
import type { Anime } from "@prisma/client";
import { AnimeWithGenre } from "./api/anime";

const endpoints = {
  anime: {
    info: (malId: number) =>
      ipcRenderer.invoke("anime:info", malId) as Promise<AnimeWithGenre>,
    search: (query: string) =>
      ipcRenderer.invoke("anime:search", query) as Promise<Anime[]>,
    posters: () => ipcRenderer.invoke("anime:posters") as Promise<Anime[]>,
    genre: (name: string) =>
      ipcRenderer.invoke("anime:genre", name) as Promise<Anime[]>,
    recommendations: (malId: number) =>
      ipcRenderer.invoke("anime:recommendations", malId) as Promise<Anime[]>,
  },
  episode: {
    info: (kitsuId: number) => ipcRenderer.invoke("episode:info", kitsuId),
    get: (malId: number, slug: string, episodeNum: number) =>
      ipcRenderer.invoke("episode:get", malId, slug, episodeNum),
  },
  cache: {
    httpDelete: () => ipcRenderer.invoke("cache:http-delete"),
  },
};

export type EndpointType = typeof endpoints;

contextBridge.exposeInMainWorld("api", endpoints);
