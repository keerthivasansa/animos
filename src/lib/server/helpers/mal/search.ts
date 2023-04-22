import axios from 'axios';
import { load } from 'cheerio';
import { getOriginalImageUrl } from './utils';

const sortKeys = {
	'episode-count': 4,
	popularity: 7,
	score: 3
};

type Anime = {
	title: string;
	synopsis: string;
	type: string;
	episodes: number;
	score: number;
	rating: string;
};

type AnimeString = Record<keyof Anime, string>;

enum AnimeStatus {
	Finished,
	Airing,
	Upcoming
}

interface SearchFilter {
	query: string;
	sort: { type: keyof typeof sortKeys; order: 'desc' | 'asc' };
	status: AnimeStatus;
}

export class MALSearch {
	private static baseUrl = 'https://myanimelist.net';
	private static client = axios.create({
		baseURL: this.baseUrl
	});

	static async getSearch(filter: Partial<SearchFilter>) {
		const params = this.getSearchParams(filter);
		console.log(params.toString());

		const response = await this.client.get('/anime.php', {
			params
		});

		const $page = load(response.data);

		const table = $page('tbody').last();
		const rows = table.find('tr');

		const headers = [
			'image',
			'title',
			'synopsis',
			'type',
			'episodes',
			'score',
			'members',
			'rating'
		];

		const result: Anime[] = [];

		rows.each((index, row) => {
			if (index === 0)
				// header row
				return;

			const $row = $page(row);

			const valueArr: string[] = [];

			$row.find('td').each((index, td) => {
				const data$ = $page(td);
				if (index === 0) {
					const src = data$.find('img').data('src') as string | undefined;
					if (!src) throw new Error('Missing image in anime row');
					const img = getOriginalImageUrl(src);
					valueArr.push(img);
				} else if (index == 1) {
					const title = data$.find('div.title > a > strong').text();
					const synopsis = data$.find('div.pt4').text();

					valueArr.push(title);
					valueArr.push(synopsis);
				} else {
					const value = data$.text().trim();

					valueArr.push(value);
				}
			});

			const animeStr = headers.reduce((prev, current, index) => {
				return { ...prev, [current]: valueArr[index] };
			}, {} as AnimeString);

			const anime: Anime = {
				...animeStr,
				episodes: Number(animeStr.episodes),
				score: Number(animeStr.score)
			};

			result.push(anime);
		});

		return result;
	}

	static getSearchParams(filter: Partial<SearchFilter>) {
		const params = new URLSearchParams();

		if (filter.query) params.set('q', filter.query);

		if (filter.sort) {
			const sortCol = sortKeys[filter.sort.type];
			const order = filter.sort.order === 'asc' ? 0 : 1;
			params.set('o', sortCol.toString());
			params.set('w', order.toString());
		}

		const columns = ['a', 'b', 'c', 'f', 'g'];

		columns.forEach((col) => params.append('c[]', col));

		return params;
	}
}
