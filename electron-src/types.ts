import { Anime, Episode } from "@prisma/client";

export type WindowState = "maximise" | "minimize" | "close";

export interface EpisodeWithAnime extends Episode {
  anime: Anime;
}