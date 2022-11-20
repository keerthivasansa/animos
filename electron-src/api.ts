import axios from "axios";
import { fetchAnimixAnimeInfo } from "./animix.js"
import { db } from "./db.js";
import { fetchGogoAnimeInfo } from "./scraper.js"

export { fetchTrendingPoster } from "./scraper.js"

async function getSlug(malId:number) {
    const res = await fetchAnimixAnimeInfo({ malId }) as any;
    if (!res)
        return '';
    return res.animeId
} 

export async function search(query:string) {
    const res = await axios.get(`https://api.jikan.moe/v4/anime?filter[text]=${query}`)
    let { data } = res.data;
    let animes = data.map(anime => {
        return {
            malId: anime.mal_id, 
            title: anime.title, 
            title_en: anime.title_english, 
            title_jp: anime.title_japanese,
            synopsis: anime.synopsis, 
            genres: anime.genres.map(obj => obj.name).join(","),
        }
    })
    animes.forEach(async (anime) => {
        let gogoSlug = await getSlug(anime.malId);
        anime.slug = gogoSlug;
        if (gogoSlug && !anime.episodes) {
            anime.episodes = await getEpisodes(gogoSlug);
        }
        db.records.create("anime", anime);
    })
    return animes;   
}

async function getEpisodes(slug:string) {
    const res = await fetchGogoAnimeInfo({ animeId:slug});
    if (!res)
        return 0;
    console.log("Gogo anime info")
    return parseInt(res.eptotal)
}

export async function getAnime(malId: number) {
    let resp = await axios.get(`https://api.jikan.moe/v4/anime/${malId}`);
    let { data } = resp.data;
    let gogoSlug = await getSlug(malId);
    return {
        malId, 
        title: data.title, 
        title_en: data.title_english, 
        title_jp: data.title_japanese,
        synopsis: data.synopsis, 
        genres: data.genres.map(obj => obj.name).join(","),
        slug: gogoSlug, 
        episodes: data.episodes ?? gogoSlug ? await getEpisodes(gogoSlug) : ''
    }
}