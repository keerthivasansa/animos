import { authProcedure, t } from "../server";
import { db } from "$lib/db";
import { z } from "zod";

const defaultPreferences = {
  accentColor: "#fff",
};

export const userRouter = t.router({
  getPreferences: authProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return defaultPreferences;
    }
    const user = await ctx.user.get();
    if (user == null) {
      return defaultPreferences;
    } else {
      return {
        accentColor: user.accentColor,
      };
    }
  }),
  mutatePreferences: authProcedure
    .input(
      z.object({
        accentColor: z.string().regex(/#[a-z0-9]{6}/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { accentColor } = input;
      await db.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          accentColor,
        },
      });
      return "ok";
    }),
});
