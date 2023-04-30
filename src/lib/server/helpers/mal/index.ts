import axios, { Axios } from 'axios';
import { MALSearch } from './search';
import { AnimeStatus } from '@prisma/client';

export class MAL {
	private static baseUrl = 'https://myanimelist.net';
	private static client: Axios = axios.create({
		baseURL: this.baseUrl
	});
	private readonly malId: number;
	private readonly url: string;

	constructor(malId: number) {
		this.malId = malId;
		this.url = `/anime/${malId}`;
	}

	static getTrending(page: number) {
		const anime = MALSearch.getSearch({
			sort: {
				order: 'desc',
				type: 'popularity'
			},
			status: AnimeStatus.CURRENTLY_AIRING,
			page
		});
		return anime;
	}

	static async getMostPopular() {
		const animeArray = await MALSearch.getSearch({
			sort: {
				type: 'popularity',
				order: 'desc'
			}
		});
		return animeArray;
	}

	async getInfo() {
		const response = MAL.client.get(this.url);
	}
}
