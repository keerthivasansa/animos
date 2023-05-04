import Jikan from '$lib/common/jikan';
import { AnimeService } from '@server/services/anime';

export const load = async () => {
	const trendingList = await AnimeService.getTrending();
	const recommendations = await AnimeService.getGenre('Action');
	return {
		trendingList,
		recommendations
	};
};
