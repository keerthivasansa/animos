import { trpc } from "$lib/trpc";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => {
  const { params } = event;
  const trpcClient = trpc(event);
  const kitsuId = parseInt(params.id);
  const anime = await trpcClient.anime.get.query(kitsuId);
  return { anime };
};
