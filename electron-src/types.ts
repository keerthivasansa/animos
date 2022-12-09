import { Anime, Episode } from "@prisma/client";

export type WindowState = "maximize" | "minimize" | "close";

export interface EpisodeWithAnime extends Episode {
  anime: Anime;
}

export type Headers = Record<string, string[]>;
