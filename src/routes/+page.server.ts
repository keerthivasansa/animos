import Jikan from '$lib/common/jikan';
import { AnimeService } from '@server/services/anime';

export const load = async () => {
	const trendingList = await AnimeService.getTrending();
	const ACTION_GENRE = 1;
	const recommendations = await Jikan.getGenre(ACTION_GENRE);
	return {
		trendingList,
		recommendations
	};
};
