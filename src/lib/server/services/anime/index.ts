import { MAL } from '$lib/server/helpers/mal';
import providers, { type AvailableProvider } from '@server/providers';
import type Provider from '@server/providers/generic';

export class AnimeService {
	private malId: number;

	constructor(malId: number) {
		this.malId = malId;
	}

	static async getMostPopular() {
		const result = await MAL.getMostPopular();
		return result;
	}

	getProvider(providerName: AvailableProvider): Provider {
		const provider = new providers[providerName](this.malId);
		return provider;
	}

	async getEpisodes() {
		const provider = this.getProvider('consumet');
		const episodes = await provider.getEpisodes(1);
		return episodes;
	}

	async getSource(episode: string | number) {
		const provider = this.getProvider('consumet');
		const source = await provider.getSource(episode);
		return source;
	}
}
