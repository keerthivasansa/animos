import db from '@server/database';
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
	 * Adds a caching layer on top of `getProviderId()`
	 * @returns The anime's corresponding ID in the current provider.
	 */
	async getId() {
		const animeProvider = await db.animeProvider.findUnique({
			where: {
				malId_provider: {
					malId: this.malId,
					provider: this.identifier
				}
			}
		});
		if (animeProvider) return animeProvider.providerId;
		const id = await this.getProviderId();
		await db.animeProvider.create({
			data: {
				malId: this.malId,
				provider: this.identifier,
				providerId: id
			}
		});
		return id;
	}

	/**
	 * @returns All the episodes from the provider assoiciated with the anime
	 */
	abstract getEpisodes(): Promise<ProviderEpisode[]>;

	/**
	 * Used to get the source from the provider
	 * @param episode The id that uniquely identifies an episode to the provider.
	 * @param getLength Whether the length of the given episode is to be fetched. If false, length of 0 is returned.
	 * @returns The primary HLS source of the episode
	 */
	abstract getSourceInfo(
		episodeId: string,
		getLength?: boolean
	): Promise<{ url: string; length: number }>;
}

export default Provider;
