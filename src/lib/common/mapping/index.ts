import axios from 'axios';

type ExternalServices = 'kitsu_id' | 'livechart_id';

type MappingApiResponse = Record<ExternalServices, number | undefined>;

class Mapping {
	private static baseUrl = 'https://api.animos.cf';
	private static client = axios.create({ baseURL: this.baseUrl });

	static async getId(malId: number, externalService: ExternalServices) {
		const response = await this.client.get<MappingApiResponse>(`/mal/${malId}`);
		const map = response.data;
		const id = map[externalService];
		return id;
	}
}

export default Mapping;
