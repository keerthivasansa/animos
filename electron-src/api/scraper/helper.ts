import axios from "axios";

const gogoApiBase = "https://gogoanime.consumet.org/";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
export const headerOption = { headers: { "User-Agent": USER_AGENT } };

export const fetchGogoEpisodeSource = async ({ episodeId }) => {
  if (!episodeId) throw new Error("No episode id was provided");
  const animeId = episodeId.split("-").reverse().splice(2).reverse().join("-");
  const episodeNum = episodeId.split("-").splice(-1).join("");
  try {
    const res = await axios.get(
      gogoApiBase + `vidcdn/watch/${animeId}-episode-${episodeNum}`,
      headerOption
    )
    return res.data.sources[0].file
  } catch (e) {
    console.error("Episode source not found");
    console.error(e)
    return "";
  }
};
