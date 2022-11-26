import type { Episode, SkipTime } from "@prisma/client";

export enum State {
  Loading,
  Finished,
}

export interface EpisodeWithSkip extends Episode {
  skipTimes: SkipTime[];
}
