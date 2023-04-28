import { MalSync } from '@server/helpers/malsync';

export type ProviderName = 'Gogoanime' | 'default' | '9anime' | 'zoro' | 'animepahe';

type ProviderEpisode = {
	id: string;
	number: number;
	title?: string;
	length?: number;
};

/**
 * External providers that provide the source and episode information.
 */
abstract class Provider {
	public identifier: ProviderName = 'default';
	public malSyncId = '';
	public malId: number;

	constructor(malId: number) {
		this.malId = malId;
	}

	/**
	 * Maps the MAL id to the external provider.
	 * By default uses the malsync api to map.
	 * Override this function to implement a custom map.
	 * @returns The ID of the anime in the provider.
	 */
	async getProviderId() {
		if (this.identifier === 'default') throw new Error('Default provider has been called.');
		const id = await MalSync.getProviderId(this.malId, this.malSyncId);
		return id;
	}

	/**
	 * @returns All the episodes from the provider assoiciated with the anime
	 */
	abstract getEpisodes(): Promise<ProviderEpisode[]>;

	/**
	 * Used to get the source from the provider
	 * @param episode The id that uniquely identifies an episode to the provider.
	 * @returns The primary HLS source of the episode
	 */
	abstract getSourceInfo(episodeId: string, getLength?: boolean): Promise<{ url: string; length: number }>;
}

export default Provider;
