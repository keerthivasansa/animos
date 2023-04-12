import { TRPCError, type inferAsyncReturnType, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import type { RequestEvent } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";
import { db } from "$lib/db";

export async function createContext(event: RequestEvent) {
  const jwtCookie = event.cookies.get("jwt");
  try {
    const { id } = jwt.verify(jwtCookie || "", JWT_SECRET) as { id: string };
    return {
      user: {
        id,
        get: () =>
          db.user.findUnique({
            where: {
              id,
            },
          }),
      },
    };
  } catch {
    return { user: null };
  }
}

type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

const validateUser = t.middleware(async ({ ctx, next }) => {
  if (ctx.user == null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  } else {
    return await next({
      ctx: {
        user: ctx.user,
      },
    });
  }
});

export const authProcedure = t.procedure.use(validateUser);
