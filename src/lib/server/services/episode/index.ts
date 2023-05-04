import db from '@server/database';
import UserService from '../user';
import { AnimeSkip } from '$lib/common/aniskip';
import type { EpisodeProvider, SkipTime } from '@prisma/client';

class EpisodeService {
	private malId: number;

	constructor(malId: number) {
		this.malId = malId;
	}

	async getWatchTime(userId: string, episodeId: string) {
		const history = await db.episodeHistory.findUnique({
			where: {
				episodeId_userId: {
					episodeId,
					userId
				}
			}
		});
		if (!history) return 0;
		return history.watchTime;
	}

	async updateWatchTime(userId: string, episodeId: string, watchTime: number) {
		await db.episodeHistory.upsert({
			create: {
				watchTime,
				episodeId,
				userId
			},
			update: {
				watchTime
			},
			where: {
				episodeId_userId: {
					episodeId,
					userId
				}
			}
		});
	}

	async getEpisodes() {
		const provider = UserService.getProvider(this.malId);
		const episodes = await db.episodeProvider.findMany({
			where: {
				animeId: this.malId,
				provider: provider.identifier
			},
			orderBy: {
				episodeNumber: 'asc'
			}
		});
		if (episodes.length) return episodes;
		const eps = await provider.getEpisodes();
		const newEpisodes = await db.$transaction(
			eps.map((ep) => {
				return db.episodeProvider.create({
					data: {
						animeId: this.malId,
						episodeNumber: ep.number,
						episodeProviderId: ep.id,
						provider: provider.identifier
					}
				});
			})
		);
		console.log(newEpisodes);
		return newEpisodes;
	}

	async getSource(episodeId: string): Promise<EpisodeProvider & { skipTimes?: SkipTime[] }> {
		const provider = UserService.getProvider(this.malId);
		const episodeProvider = await db.episodeProvider.findUnique({
			where: {
				provider_animeId_episodeProviderId: {
					provider: provider.identifier,
					animeId: this.malId,
					episodeProviderId: episodeId
				}
			},
			include: {
				skipTimes: true
			}
		});
		if (!episodeProvider) throw new Error('No such episode'); // TODO add episodes again.
		if (episodeProvider.source && episodeProvider.skipTimes.length) {
			return episodeProvider;
		}

		let skipTimes:
			| {
					type: 'OPENING' | 'ENDING';
					start: number;
					end: number;
			  }[]
			| null;

		let info: {
			url: string;
			length: number;
		};
		if (episodeProvider.exactLength != null) {
			const length = episodeProvider.exactLength;
			[skipTimes, info] = await Promise.all([
				AnimeSkip.getSkipTimes(this.malId, episodeProvider.episodeNumber, length),
				provider.getSourceInfo(episodeId, false)
			]);
		} else {
			info = await provider.getSourceInfo(episodeId);
			skipTimes = await AnimeSkip.getSkipTimes(
				this.malId,
				episodeProvider.episodeNumber,
				info.length
			);
		}
		const closestLength = info.length - (info.length % 100);
		const exactLength = info.length;
		const episode = await db.episode.upsert({
			create: {
				animeMalId: this.malId,
				length: closestLength,
				number: episodeProvider.episodeNumber
			},
			where: {
				animeMalId_number_length: {
					animeMalId: this.malId,
					length: closestLength,
					number: episodeProvider.episodeNumber
				}
			},
			update: {}
		});
		const result = await db.episodeProvider.update({
			where: {
				provider_animeId_episodeProviderId: {
					provider: provider.identifier,
					animeId: this.malId,
					episodeProviderId: episodeId
				}
			},
			data: {
				episodeId: episode.id,
				source: info.url,
				exactLength
			}
		});
		if (skipTimes) {
			const times = await db.$transaction(
				skipTimes.map((skip) =>
					db.skipTime.create({
						data: {
							type: skip.type,
							end: skip.end,
							start: skip.start,
							episodeProviderId: result.id
						}
					})
				)
			);
			return { ...result, skipTimes: times };
		} else return result;
	}
}

export default EpisodeService;
