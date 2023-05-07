import { AnimeService } from '@server/services/anime';

export const prerender = true;

export const load = async () => {
	const trendingList = await AnimeService.getTrending();
	const recommendations = await AnimeService.getGenre('Action');
	return {
		trendingList,
		recommendations
	};
};
