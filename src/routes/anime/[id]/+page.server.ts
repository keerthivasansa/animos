import Jikan from '$lib/common/jikan/index.js';
import { AnimeService } from '@server/services/anime/index.js';

export async function load({ params }) {
	const { id } = params;
	const malId = Number(id);
	try {
		const animeService = new AnimeService(malId);
		const anime = await animeService.getInfo();
		// const recommendations = await Jikan.getRecommendations(malId);
		console.log("done");
		return { anime };
	} catch (err) {
		console.log("err")
		console.log(err);
	}
}
