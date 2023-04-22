import { AnimeService } from '@server/services/anime';

// Use this route to demo server servcies and controllers.

export const load = async () => {
	// const ids = await MAL.getMostPopular();
	try {
		const anime = new AnimeService(33255);
		console.time('getting info');
		const consumet = anime.getProvider('consumet');
		// const episodes = (await consumet.getEpisodes(1)).slice(0, 25);
		const info = await consumet.getSource('HjybC8g=');
		console.log(info);
		console.timeEnd('getting info');
	} catch (err) {
		console.log(err);
	}
};
