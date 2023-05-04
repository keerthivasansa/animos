import { JikanClient, TopAnimeFilter } from '@tutkli/jikan-ts';
import type { MalGenre } from './genre';
import genres from './genre';

class Jikan {
	private static client = new JikanClient();

	static async getTrending(page = 1) {
		const result = await this.client.top.getTopAnime({
			filter: TopAnimeFilter.airing,
			page
		});
		return result;
	}

	static async getMostPopular(page = 1) {
		const result = await this.client.anime.getAnimeSearch({
			sort: 'desc',
			order_by: 'members',
			sfw: true,
			page
		});
		return result;
	}

	static async getSearch(q:string, page = 1) {
		const result = await this.client.anime.getAnimeSearch({ q, page });
		return result;
	}

	static async getGenre(genreId: MalGenre) {
		const genreMalId = genres[genreId];
		const result = await this.client.anime.getAnimeSearch({
			genres: genreMalId.toString(),
			sort: 'desc',
			order_by: 'members',
			sfw: true
		});
		return result;
	}
}

export default Jikan;
