import { AnimeService } from '@server/services/anime';

// Use this route to demo server servcies and controllers.

export const load = async () => {
	// const ids = await MAL.getMostPopular();
	// try {
	const anime = new AnimeService(1535);
	console.time('getting info');
	anime.setProvider("gogo");
	// const episodes = await anime.getSource('2');
	const info = await anime.getSource("2");
	console.timeEnd('getting info');
	console.log(info);
	// } catch (err) {
	// 	console.log(err);
	// }
};
