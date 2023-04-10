import { GlobalService } from "../api/global";
import { t } from "../server";

export const globalRouter = t.router({
  getVisits: t.procedure.query(async () => {
    const global = await GlobalService.getGlobal();
    return global.visits;
  }),
});
