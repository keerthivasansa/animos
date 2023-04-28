import type { AvailableProvider } from '@server/providers';
import providers from '@server/providers';
import type Provider from '@server/providers/generic';

class UserService {
	private static currentProvider: AvailableProvider = 'animepahe';

	static getProvider(malId: number): Provider {
		const providerClass = providers[this.currentProvider];
		const provider = new providerClass(malId);
		return provider;
	}

	static setProvider(provider: AvailableProvider) {
		this.currentProvider = provider;
	}
}

export default UserService;
