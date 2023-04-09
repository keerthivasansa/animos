import { GlobalService } from "$lib/trpc/api/global"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
    const global = await GlobalService.getGlobal();
    return {
        visits: global.visits
    }
}