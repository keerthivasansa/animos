import axios from 'axios';
import Provider, { type ProviderName } from '../generic';
import type { ConsumetInfoResponse, SourceResponse } from '@server/types/consumet';
import { getHlsDuration, getProxyUrl } from '../utils';

class Consumet extends Provider {
	private baseUrl = 'https://api.consumet.org/anime';
	private client = axios.create({ baseURL: this.baseUrl });
	public identifier: ProviderName = 'default';

	constructor(malId: number) {
		super(malId);
	}

	async getEpisodes() {
		// consumet does not have pagination for episodes
		console.log('Awefwe');
		const id = await this.getProviderId();
		try {
			const response = await this.client.get<ConsumetInfoResponse>(
				`/${this.identifier}/info/${id}`
			);
			console.log('awef');
			return response.data.episodes;
		} catch (err) {
			console.log('failed to get info');
			console.log(err);
			throw err;
		}
	}

	async getSourceInfo(episodeId: string) {
		const response = await this.client.get<SourceResponse>(`${this.identifier}/watch/${episodeId}`);
		const autoSource = response.data.sources.find((source) => source.quality === 'auto');
		const firstSource = response.data.sources.find((source) => source.quality !== 'auto');
		if (!firstSource) throw new Error('Source list is empty');
		const length = await getHlsDuration(firstSource.url);
		const url = autoSource?.url || firstSource.url;
		return { url: getProxyUrl(url), length };
	}
}

export default Consumet;
