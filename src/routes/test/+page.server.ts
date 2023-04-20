import { MAL } from "@server/helpers/mal";

// Use this route to demo server servcies and controllers. 

export const load = async () => {
    // const ids = await MAL.getMostPopular();
    console.log("Awef");
    try {
        const anime = await MAL.getMostPopular();
        // console.log(ids);
        console.log(anime.slice(0, 3))
    } catch (err) {
        console.log(err);
    }
}