import type { trpc } from "./trpc";
import type { inferAsyncReturnType } from "@trpc/server"

export enum State {
  Loading,
  Finished,
}

export type TrpcClient = ReturnType<typeof trpc>;
export type EpisodeWithSkip = inferAsyncReturnType<TrpcClient["episode"]["get"]["query"]>