export function getAnimeRating(jikanRating: string) {
	if (jikanRating) return jikanRating.split('-')[0].trim();
	else return '';
}
