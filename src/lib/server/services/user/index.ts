import db from '@server/database';
import type { AvailableProvider } from '@server/providers';
import providers from '@server/providers';
import type Provider from '@server/providers/generic';

class UserService {
	private static currentProvider: AvailableProvider = 'animepahe';
	private userId: string;

	constructor(userId: string) {
		this.userId = userId;
	}

	async getWatchHistory() {
		const watchHistory = await db.episodeHistory.findMany({
			include: {
				episode: true
			},
			where: {
				userId: this.userId
			},
			take: 5
		});

		return watchHistory;
	}

	async getGenre() {
		const history = await db.episodeHistory.findFirst({
			select: {
				episode: {
					select: {
						anime: {
							select: {
								genre: true
							}
						}
					}
				}
			},
			where: {
				userId: this.userId
			}
		});
		if (!history) return 'Action';

		const currentAnimeGenres = history.episode.anime.genre.split(',');

		if (currentAnimeGenres.length < 1) return 'Action';

		return currentAnimeGenres[0];
	}

	static getProvider(malId: number): Provider {
		const providerClass = providers[this.currentProvider];
		const provider = new providerClass(malId);
		return provider;
	}

	static setProvider(provider: AvailableProvider) {
		this.currentProvider = provider;
	}
}

export default UserService;
