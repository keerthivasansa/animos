import { getAnimeRating } from '$lib/utils';
import db from '@server/database';
import type { Anime } from '@tutkli/jikan-ts';

class AnimeModel {
	static async insertOrUpdate(anime: Anime) {
		const animeData = {
			episodes: anime.episodes || -1,
			image: anime.images.webp?.image_url || anime.images.jpg.image_url,
			malId: anime.mal_id,
			rating: getAnimeRating(anime.rating),
			score: anime.score,
			synopsis: anime.synopsis,
			title: anime.title_english || anime.title,
			type: anime.title
		};
		const result = await db.anime.upsert({
			create: animeData,
			update: animeData,
			where: {
				malId: anime.mal_id
			}
		});
		return result;
	}
}

export default AnimeModel;
