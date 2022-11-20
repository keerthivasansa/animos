export type WindowState = "maximise" | "minimize" | "close";

export interface TrendingPoster {
  title: string;
  img: string;
  malId: number;
  score: number;
  index: number;
}

export interface Anime {
  malId: number;
  title: string;
  title_en: string;
  title_jp: string;
  synopsis: string;
  kitsuId: string;
  genres: string;
  posterImg: string;
  coverImg: string;
  slug: string[];
  episodes: number;
}
