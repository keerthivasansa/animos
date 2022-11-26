import { fetchAnimixEpisodeSource } from "./electron-src/api/scraper";

fetchAnimixEpisodeSource({
    episodeId: "rezero-kara-hajimeru-isekai-seikatsu-episode-0"
}).then(result => {
    console.log(result)
})