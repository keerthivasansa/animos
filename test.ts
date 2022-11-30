import { fetchAnimixEpisodeSource } from "./electron-src/api/scraper";

fetchAnimixEpisodeSource({
  episodeId:
    "tokyo-revengers-episode-1",
}).then((result) => {
  console.log(result);
});
