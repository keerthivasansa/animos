import { authProcedure, t } from "../server";

export const authRouter = t.router({
  current: t.procedure.query(async ({ ctx }) => {
    if (ctx.user == null) return null;
    const user = await ctx.user.get();
    return user;
  }),
  // TODO login, register with form actions
});
