import axios from 'axios';
import Mapping from '../mapping';

type KitsuAnimeResponse = {
	data: {
		attributes: {
			coverImage?: {
				original: string;
			};
		};
	};
};
export class Kitsu {
	private static baseUrl = 'https://kitsu.io/api/edge';
	private static client = axios.create({ baseURL: this.baseUrl });

	static async getId(malId: number) {
		const id = await Mapping.getId(malId, 'kitsu_id');
		if (!id) throw new Error('Kitsu ID is missing for anime: ' + malId);
		return id;
	}

	static async getPoster(malId: number) {
		const id = await this.getId(malId);
		const response = await this.client.get<KitsuAnimeResponse>(`/anime/${id}`);
		const anime = response.data;
		// console.log(anime.data.attributes.coverImage);
		if (anime.data.attributes.coverImage) return anime.data.attributes.coverImage.original;
		else return '';
	}
}
