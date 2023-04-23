import { AnimeSkip } from '@server/helpers/aniskip';
import { AnimeService } from '@server/services/anime';

// Use this route to demo server servcies and controllers.

export const load = async () => {
	// const ids = await MAL.getMostPopular();
	// try {
	const anime = await AnimeSkip.getSkipTimes(1535, 2, 1390);
	console.log(anime)
	// } catch (err) {
	// 	console.log(err);
	// }
};
