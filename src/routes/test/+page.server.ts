import { AnimeService } from '@server/services/anime';

// Use this route to demo server servcies and controllers.

export const load = async () => {
	// const ids = await MAL.getMostPopular();
	// try {
	const anime = new AnimeService(1535);
	console.time('getting info');
	const episodes = anime.getProvider();
	const info = await episodes.getEpisodes();
	console.timeEnd('getting info');
	console.log(info);
	// } catch (err) {
	// 	console.log(err);
	// }
};
