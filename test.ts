import { fetchAnimixEpisodeSource } from "./electron-src/api/scraper";

fetchAnimixEpisodeSource({
  episodeId:
    "rezero-kara-hajimeru-isekai-seikatsu-hyouketsu-no-kizuna-episode-1",
}).then((result) => {
  console.log(result);
});
