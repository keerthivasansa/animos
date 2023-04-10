import type { Anime, Episode, History } from ".prisma/client";
import type { trpc } from "./trpc";
import type { inferAsyncReturnType } from "@trpc/server";

export enum State {
  Loading,
  Finished,
}

export type TrpcClient = ReturnType<typeof trpc>;
export type EpisodeWithSkip = inferAsyncReturnType<
  TrpcClient["episode"]["get"]["query"]
>;

export interface EpisodeWithAnime extends Episode {
  anime: Anime;
  history: History;
}
