import { load } from 'cheerio';
import Provider, { type ProviderName } from '../generic';
import axios from 'axios';
import { USER_AGENT, headerOption } from '../utils';
import { decryptAjaxResponse, getAjaxParams } from './scraper';

class GogoProvider extends Provider {
	identifier: ProviderName = 'Gogoanime';
	private baseUrl = 'https://gogoanime.cl';
	private client = axios.create({ baseURL: this.baseUrl });

	constructor(malId: number) {
		super(malId);
	}

	async getSource(episodeId: string | number) {
		const gogoSlug = await this.getProviderId();
		const url = `/${gogoSlug}-episode-${episodeId}`;
		const response = await this.client.get(url);
		const $ = load(response.data);

		const gogoWatch = $('div.anime_muti_link > ul > li.vidcdn > a').attr('data-video');
		const gogoWatchLink = new URL('https:' + gogoWatch);

		const gogoServerRes = await axios.get(gogoWatchLink.href, headerOption);
		const $$ = load(gogoServerRes.data);

		const id = gogoWatchLink.searchParams.get('id');

		if (!id) throw new Error('Failed to get Id.');

		const params = await getAjaxParams($$, id);

		const fetchRes = await axios.get(
			`${gogoWatchLink.protocol}//${gogoWatchLink.hostname}/encrypt-ajax.php?${params}`,
			{
				headers: {
					'User-Agent': USER_AGENT,
					'X-Requested-With': 'XMLHttpRequest'
				}
			}
		);

		const finalSource = await decryptAjaxResponse(fetchRes.data);
		if (!finalSource.source) return { error: 'No sources found' };

		return finalSource;
	}

	async getId(): Promise<string> {
		const slug = await this.getProviderId();
		const response = await this.client.get(`/category/${slug}`);
		const $ = load(response.data);
		const id = $('#movie_id').val();
		if (typeof id !== 'string') throw new Error('GogoID is not a string');
		return id;
	}

	async getEpisodes() {
		const id = await this.getId();
		// add caching.
		const response = await this.client.get('https://ajax.gogo-load.com/ajax/load-list-episode', {
			params: {
				ep_start: 0,
				ep_end: 9999,
				id
			}
		});
		const $ = load(response.data);
		const ul = $('ul');
		const lastEp = ul.children().first().find('div.name').text();
		const firstEp = ul.children().last().find('div.name').text();
		const [last, first] = [lastEp, firstEp].map((val) => Number(val.replace('EP ', '')));
		// const type = first === 0 ? "zero" : "normal";
		return Array.from({ length: last - first + 1 }, (_, index) => {
			return { number: first + index, id: index.toString() };
		});
	}
}

export default GogoProvider;
