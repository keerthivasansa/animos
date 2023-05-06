import type { RecommendationEntry, Anime } from '@tutkli/jikan-ts';

type AnimeLike = Anime | RecommendationEntry

export function getImageUrl(anime: AnimeLike) {
	let imageUrl: string;
	let noImage = false;
	const MAL_NO_IMAGE_URL = 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png';
	const NO_IMAGE_URL =
		'https://img.freepik.com/premium-photo/3d-square-ceramic-black-tile-white-grout-background-decor-modern-home-kitchen-wall_73274-609.jpg';

	if (anime.images.jpg.image_url !== MAL_NO_IMAGE_URL) {
		imageUrl = anime.images.webp?.image_url || anime.images.jpg.image_url;
	} else {
		imageUrl = NO_IMAGE_URL;
		noImage = true;
	}

	return { imageUrl, noImage };
}

export function getTitle(anime: AnimeLike) {
	if (Object.hasOwn(anime, "title_english")) {
		const a = anime as Anime
		return a.title_english || a.title;
	}
	else return anime.title;
}

export function isFullAnime(anime: AnimeLike) {
	let fullAnime = false;
	if (Object.hasOwn(anime, "score")) {
		fullAnime = true;
		return { anime: anime as Anime, fullAnime } as const;
	}
	else
		return { fullAnime, anime } as const;
}