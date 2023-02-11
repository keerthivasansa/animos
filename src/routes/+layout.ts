import { trpc } from "$lib/trpc";
import type { PageLoad } from "./info/[id]/$types";

export const load: PageLoad = async (event) => {
    let user = await trpc(event).auth.current.query();
    console.log(user);
    return {
        user
    }
}