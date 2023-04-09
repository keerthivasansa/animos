import { json, type Handle } from "@sveltejs/kit";
import { router } from "$lib/trpc/index";
import { createContext } from "$lib/trpc/server";
import { createTRPCHandle } from "trpc-sveltekit";
import { sequence } from "@sveltejs/kit/hooks";
import { GlobalService } from "$lib/trpc/api/global";


const trpcHandle = createTRPCHandle({ router, createContext });

const visitHook: Handle = async ({ event, resolve }) => {
    const { url } = event;
    if (url.pathname.startsWith("/trpc"))
        return resolve(event);
    if (url.pathname == "/badge/visits") {
        const global = await GlobalService.getGlobal();
        return json({
            "schemaVersion": 1,
            "label": "Visits",
            "message": global.visits.toString(),
            "color": "brightgreen"
        });
    }
    GlobalService.addVisit();
    return resolve(event);
}

export const handle: Handle = sequence(visitHook, trpcHandle);
