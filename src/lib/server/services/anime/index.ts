import { MAL } from '@server/helpers/mal';
import db from '@server/database';
import providers, { type AvailableProvider } from '@server/providers';
import type Provider from '@server/providers/generic';
import type { Prisma, Episode } from "@prisma/client"


type EpisodeProviderInsertPromise = Prisma.Prisma__EpisodeProviderClient<{
	source: string;
	episode: {
		number: number;
		title: string | null;
		length: number;
	};
}, never>;

export class AnimeService {
	private malId: number;

	constructor(malId: number) {
		this.malId = malId;
	}

	static async getMostPopular() {
		const result = await MAL.getMostPopular();
		return result;
	}

	getPreferredProvider(): AvailableProvider {
		return "9anime";
	}

	getProvider(providerName?: AvailableProvider): Provider {
		providerName ||= this.getPreferredProvider();
		const provider = new providers[providerName](this.malId);
		return provider;
	}

	async getEpisodes() {
		const provider = this.getProvider();
		const providerId = provider.identifier;
		const episodes = await db.episodeProvider.findMany({
			where: {
				provider: providerId,
				episodeAnimeMalId: this.malId
			},
			select: {
				source: true,
				episode: {
					select: {
						title: true,
						length: true,
						number: true
					}
				}
			}
		});
		if (episodes.length) {
			console.log("cache hit");
			return episodes;
		}
		const providerEpisodes = await provider.getEpisodes();

		const episodeCheckPromises: Prisma.Prisma__EpisodeClient<Episode, never>[] = [];
		const episodeProviderInserts: EpisodeProviderInsertPromise[] = [];

		const infoPromise =
			providerEpisodes.map(async (val) => {
				const info = await provider.getSourceInfo(val.id);
				const episodeInsert = db.episode.upsert({
					create: {
						animeMalId: this.malId,
						length: info.length,
						title: val.title,
						number: val.number,
					},
					update: {},
					where: {
						animeMalId_number_length: {
							length: info.length,
							animeMalId: this.malId,
							number: val.number
						}
					}
				});
				const epInsert = db.episodeProvider.create({
					data: {
						source: info.url,
						episodeAnimeMalId: this.malId,
						episodeLength: info.length,
						episodeNumber: val.number,
						provider: providerId
					},
					select: {
						source: true,
						episode: {
							select: {
								title: true,
								length: true,
								number: true
							}
						}
					}
				});
				episodeProviderInserts.push(epInsert);
				episodeCheckPromises.push(episodeInsert);
			})
		console.time("promises");
		await Promise.all(infoPromise);
		await db.$transaction(episodeCheckPromises);
		const newEpisodes = await db.$transaction(episodeProviderInserts);
		console.timeEnd("promises");
		return newEpisodes;
	}

	async getSource(episode: string | number) {
		const provider = this.getProvider();
		const source = await provider.getSourceInfo(episode);
		return source;
	}
}
