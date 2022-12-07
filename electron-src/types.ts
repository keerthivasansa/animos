import { Anime } from "@prisma/client";

export type WindowState = "maximise" | "minimize" | "close";

export interface EpisodeWithAnime extends Episode {
  anime: Anime;
}

export interface Episode {
  watchTime: number;
  number: number;
  title: string;
  animeId: string;
  length: number;
  source: string;
  lastUpdated: Date;
}
