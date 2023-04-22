import { MalSync } from '@server/helpers/malsync';

export type ProviderName = 'Gogoanime' | 'default' | '9anime';

type ProviderEpisode = {
	id: string;
	title?: string;
	number: number;
};

/**
 * External providers that provide the source and episode information.
 */
abstract class Provider {
	public provider: ProviderName = 'default';
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
		if (this.provider === 'default') throw new Error('Default provider has been called.');
		const id = await MalSync.getProviderId(this.malId, this.provider);
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
	abstract getSource(episode: number | string): Promise<string>;
}

export default Provider;
