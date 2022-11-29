import { fetchAnimixEpisodeSource } from "./electron-src/api/scraper";

fetchAnimixEpisodeSource({
  episodeId:
    "love-live-the-school-idol-movie-episode-1",
}).then((result) => {
  console.log(result);
});
