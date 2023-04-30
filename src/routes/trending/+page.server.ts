import { MAL } from "@server/helpers/mal";

export const ssr = false;

export async function load() {
    const trending = await MAL.getTrending(1);
    return {
        trending
    }
}