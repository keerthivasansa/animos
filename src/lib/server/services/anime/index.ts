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
	private currentProvider: AvailableProvider = "9anime";
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

	getProvider(): Provider {
		const provider = new providers[this.currentProvider](this.malId);
		return provider;
	}

	setProvider(provider: AvailableProvider) {
		this.currentProvider = provider;
	}

	async getEpisodes() {
		const provider = this.getProvider();

		const cachedEpisodes = await db.episodeProvider.findMany({
			where: {
				provider: provider.identifier,
				animeId: this.malId
			}
		});

		if (cachedEpisodes.length) {
			console.log("cache hit")
			return cachedEpisodes;
		}

		const episodes = await provider.getEpisodes();
		console.log(episodes);

		const providerEpisodes = await db.$transaction(episodes.map(ep => db.episodeProvider.create({
			data: {
				episodeNumber: ep.number,
				title: ep.title,
				episodeProviderId: ep.id,
				provider: provider.identifier,
				animeId: this.malId
			}
		})))
		return providerEpisodes;
	}

	async getSource(episodeId: string) {
		const provider = this.getProvider();
		const episodeProvider = await db.episodeProvider.findUnique({
			where: {
				provider_episodeProviderId: {
					episodeProviderId: episodeId,
					provider: provider.identifier
				}
			}
		});
		if (!episodeProvider)
			throw new Error("No such episode"); // TODO add episodes again.
		if (episodeProvider.source)
			return episodeProvider;
		const info = await provider.getSourceInfo(episodeId);
		console.log(info);
		const closestLength = info.length - (info.length % 100);
		const episode = await db.episode.upsert({
			create: {
				animeMalId: this.malId,
				length: closestLength,
				number: episodeProvider.episodeNumber,
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
				provider_episodeProviderId: {
					provider: provider.identifier,
					episodeProviderId: episodeId
				}
			},
			data: {
				episodeId: episode.id,
				source: info.url
			}
		});
		return result;
	}
}
