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
		const lastWeek = Date.now() - 86400 * 7 * 1000;
		const trending = await db.trendingAnime.findMany({ include: { anime: true } });
		if (trending.length) {
			if (trending[0].createdAt.getTime() > lastWeek) return trending;
			console.log('Deleting animes available in cache.');
			await db.trendingAnime.deleteMany(); // delete available trending anime and update with new ones.
		}
		const animeList = await MAL.getTrending(1);
		const posterList = await Promise.all(
			animeList.data.slice(0, 6).map(async (anime, index) => {
				const [_, poster] = await Promise.all([
					AnimeModel.insertOrUpdate(anime),
					Kitsu.getPoster(anime.malId)
				]);
				return { malId: anime.malId, poster, index, anime };
			})
		);
		await db.trendingAnime.createMany({ data: posterList });

		return posterList;
	}

	async getTrendingList(page: number) {
		const data = await MAL.getTrending(page);
		return data;
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
		const genreAnime = await db.genreRecommendation.findMany({
			where: {
				genre
			},
			include: {
				anime: true
			}
		});

		if (genreAnime.length) return genreAnime;

		const searchResult = await MALSearch.getSearch({
			genre: [genre],
			sort: {
				order: 'desc',
				type: 'popularity'
			}
		});

		const result = await Promise.all(
			searchResult.data.map(async (anime, index) => {
				await AnimeModel.insertOrUpdate(anime);
				return {
					malId: anime.malId,
					index,
					genre,
					anime
				};
			})
		);

		await db.genreRecommendation.createMany({
			data: result.map((anime, index) => {
				return {
					genre,
					index,
					malId: anime.malId
				};
			})
		});
		return result;
	}
}
