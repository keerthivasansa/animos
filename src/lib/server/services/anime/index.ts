import { MAL } from '@server/helpers/mal';
import db from '@server/database';
import UserService from '../user';
import { MALSearch } from '@server/helpers/mal/search';
import type { MalGenre } from '@server/helpers/mal/search/genre';
import { Kitsu } from '@server/helpers/kitsu';
import AnimeModel from '@server/models/anime';

export class AnimeService {
	private malId: number;
	constructor(malId: number) {
		this.malId = malId;
	}

	static async getMostPopular() {
		const result = await MAL.getMostPopular();
		return result;
	}

	static async getTrending() {
		console.time('get trending');
		const lastWeek = Date.now() - (86400 * 7 * 1000);
		const trending = await db.trendingAnime.findMany({ include: { anime: true } });
		if (trending.length) {
			if (trending[0].createdAt.getTime() > lastWeek)
				return trending;
			console.log("Deleting animes available in cache.");
			await db.trendingAnime.deleteMany(); // delete available trending anime and update with new ones.
		}
		const animeList = await MAL.getTrending();
		const posterList = await Promise.all(
			animeList.slice(0, 6).map(async (anime, index) => {
				const [_, poster] = await Promise.all([AnimeModel.insertOrUpdate(anime), Kitsu.getPoster(anime.malId)]);
				return { malId: anime.malId, poster, index, anime }
			})
		);
		await db.trendingAnime.createMany({ data: posterList })
		console.timeEnd('get posters');

		return posterList;
	}

	async getEpisodes() {
		const provider = UserService.getProvider(this.malId);

		const cachedEpisodes = await db.episodeProvider.findMany({
			where: {
				provider: provider.identifier,
				animeId: this.malId
			},
			orderBy: {
				episodeNumber: 'asc'
			}
		});

		if (cachedEpisodes.length) {
			console.log('cache hit');
			return cachedEpisodes;
		}

		const episodes = await provider.getEpisodes();

		// return episodes;

		const providerEpisodes = await db.$transaction(
			episodes.map((ep) =>
				db.episodeProvider.create({
					data: {
						episodeNumber: ep.number,
						title: ep.title,
						episodeProviderId: ep.id,
						provider: provider.identifier,
						exactLength: ep.length,
						animeId: this.malId
					}
				})
			)
		);
		return providerEpisodes;
	}

	static async getGenre(genre: MalGenre) {
		const anime = await MALSearch.getSearch({
			genre: [genre],
			sort: {
				order: 'desc',
				type: 'popularity'
			}
		});
		return anime;
	}
}
