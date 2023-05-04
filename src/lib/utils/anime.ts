import type { Anime } from '@tutkli/jikan-ts';

export function getImageUrl(anime: Anime) {
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

export function getTitle(anime: Anime) {
	return anime.title_english || anime.title;
}
