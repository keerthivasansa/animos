import axios from 'axios';
import Provider, { type ProviderName } from '../generic';
import type { ConsumetInfoResponse, SourceResponse } from '@server/types/consumet';
import { getHlsDuration, getProxyUrl } from '../utils';

class Consumet extends Provider {
	private baseUrl = 'https://api.consumet.org/anime';
	private client = axios.create({ baseURL: this.baseUrl });
	public provider: ProviderName = 'default';

	constructor(malId: number) {
		super(malId);
	}

	async getEpisodes() {
		// consumet does not have pagination for episodes
		const id = await this.getProviderId();
		const response = await this.client.get<ConsumetInfoResponse>(`/${this.provider}/info/${id}`);
		return response.data.episodes;
	}

	async getSource(episodeId: string) {
		const response = await this.client.get<SourceResponse>(`${this.provider}/watch/${episodeId}`);
		const autoSource = response.data.sources.find((source) => source.quality === 'auto');
		const firstSource = response.data.sources.find((source) => source.quality !== 'auto');
		if (!firstSource) throw new Error('Source list is empty');
		const length = await getHlsDuration(firstSource.url);
		const url = autoSource?.url || firstSource.url;
		return { url: getProxyUrl(url), length };
	}
}

export default Consumet;
