import { animeRouter } from "./routers/anime";
import { episodeRouter } from "./routers/episode";
import { userRouter } from "./routers/user";
import { authRouter } from "./routers/auth";
import { t } from "./server";

export const router = t.router({
    anime: animeRouter,
    episode: episodeRouter,
    user: userRouter,
    auth: authRouter
})

export type Router = typeof router;
