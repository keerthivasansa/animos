import { TRPCError, type inferAsyncReturnType, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import type { RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import env from "$lib/env";
import { db } from "$lib/db";

export async function createContext(event: RequestEvent) {
    const jwtCookie = event.cookies.get("jwt");
    try {
        let { id } = jwt.verify(jwtCookie || '', env.JWT_SECRET) as { id: string };
        return {
            user: {
                id, get: () => db.user.findUnique({
                    where: {
                        id
                    }
                })
            }
        }
    } catch {
        return { user: null }
    }
}

type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
    transformer: SuperJSON
});

const validateUser = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: "UNAUTHORIZED"
        })
    } else {
        return next({
            ctx: {
                user: ctx.user
            }
        })
    }
})

export const authProcedure = t.procedure.use(validateUser);