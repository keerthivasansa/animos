import axios from 'axios';
import Provider, { type ProviderName } from './generic';
import type { ConsumetInfoResponse, SourceResponse } from '@server/types/consumet';
import { getProxyUrl } from './utils';

class Consumet extends Provider {
	private baseUrl = 'https://api.consumet.org/anime';
	private client = axios.create({ baseURL: this.baseUrl });

	constructor(malId: number) {
		super(malId);
		this.provider = '9anime';
	}

	async getEpisodes(startFrom: number) {
		// consumet does not have pagination for episodes
		const id = await this.getProviderId();
		const response = await this.client.get<ConsumetInfoResponse>(`/${this.provider}/info/${id}`);
		return response.data.episodes;
	}

	async getSource(episodeId: string): Promise<string> {
		const response = await this.client.get<SourceResponse>(`${this.provider}/watch/${episodeId}`);
		const autoSource = response.data.sources.find((source) => source.quality === 'auto');
		if (autoSource) return getProxyUrl(autoSource.url);
		const firstSource = response.data.sources.shift();
		if (!firstSource) throw new Error('Source list is empty');
		return getProxyUrl(firstSource.url);
	}
}

export default Consumet;
