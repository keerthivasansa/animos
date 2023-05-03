export function getAnimeRating(jikanRating: string) {
    return jikanRating.split("-")[0].trim();
}