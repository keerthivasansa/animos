import axios from 'axios';

export class MalSync {
	private static readonly baseUrl = 'https://api.malsync.moe';
	private static readonly client = axios.create({
		baseURL: this.baseUrl
	});

	static async getProviderId(malId: number, provider: string) {
		const response = await this.client.get(`/mal/anime/${malId}`);
		const keys = Object.keys(response.data.Sites[provider]);
		const id = keys.shift();
		if (!id) throw new Error('Missing atleast 1 key for provider in MALSync for malId: ' + malId);
		return id;
	}
}
