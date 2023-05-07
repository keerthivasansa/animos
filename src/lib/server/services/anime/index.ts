import { MAL } from '$lib/common/mal';
import db from '@server/database';
import UserService from '../user';
import type { MalGenre } from '$lib/common/mal/search/genre';
import { Kitsu } from '$lib/common/kitsu';
import AnimeModel from '@server/models/anime';
import Jikan from '$lib/common/jikan';

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
		const animeList = await Jikan.getTrending(1);
		const posterList = await Promise.all(
			animeList.data.slice(0, 6).map(async (anime, index) => {
				console.log(anime);
				const [db_anime, poster] = await Promise.all([
					AnimeModel.insertOrUpdate(anime),
					Kitsu.getPoster(anime.mal_id)
				]);
				return { malId: anime.mal_id, poster, index, anime: db_anime };
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
		const searchResult = await Jikan.getGenre(genre);
		return searchResult;
	}
}
