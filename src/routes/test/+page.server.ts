import { AnimeService } from '@server/services/anime';

// Use this route to demo server servcies and controllers.

export const load = async () => {
	// const ids = await MAL.getMostPopular();
	// try {
	const anime = new AnimeService(33255);
	console.time('getting info');
	const consumet = anime.getProvider('9anime');
	const episodes = await consumet.getSource('HjybCck=');
	console.timeEnd('getting info');
	console.log(episodes);
	// } catch (err) {
	// 	console.log(err);
	// }
};
