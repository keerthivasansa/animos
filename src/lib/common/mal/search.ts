import { load } from 'cheerio';
import { getOriginalImageUrl } from './utils';
import genres, { type MalGenre } from './search/genre';
import type { AnimeStatus, Anime } from '@prisma/client';
import { createAxios } from '@server/utils/proxy';

const sortKeys = {
	'episode-count': 4,
	popularity: 7,
	score: 3
};

const statusKeys: Record<AnimeStatus, number> = {
	CURRENTLY_AIRING: 1,
	FINISHED_AIRING: 2,
	UPCOMING: 3,
	UNKNOWN: -1
};

export type AnimeSlim = Omit<Anime, 'createdAt' | 'lastUpdated' | 'genre' | 'status'>;

type AnimeString = Record<keyof AnimeSlim, string>;

interface SearchFilter {
	query: string;
	sort: { type: keyof typeof sortKeys; order: 'desc' | 'asc' };
	status: AnimeStatus;
	genre: MalGenre[];
	page: number;
}

export class MALSearch {
	private static baseUrl = 'https://myanimelist.net';
	private static client = createAxios({
		baseURL: this.baseUrl
	});

	static async getSearch(filter: Partial<SearchFilter>) {
		const params = this.getSearchParams(filter);
		console.log(params.toString());

		const response = await this.client.get('/anime.php', {
			params
		});

		console.log(response.request.res.responseUrl);
		const $page = load(response.data);

		const currentPage = filter.page || 1;
		const lastPage = Number(
			$page('#content > div.normal_header.clearfix.pt16 > div > div > span > a').last().text()
		);

		const table = $page('tbody').last();
		const rows = table.find('tr');

		const headers = [
			'image',
			'malId',
			'title',
			'synopsis',
			'type',
			'episodeCount',
			'score',
			// 'members',
			'rating'
		];

		const result: AnimeSlim[] = [];

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
					const link = data$.find('div.title > a').attr('href');
					if (!link) throw new Error('Missing link for anime');
					const linkMatch = link?.match(/anime\/(\d+)/);
					if (!linkMatch || !linkMatch[1]) throw new Error('ID was not found in the link');
					const malId = linkMatch[1];
					const title = data$.find('div.title > a > strong').text();
					const synopsis = data$.find('div.pt4').text();

					valueArr.push(malId);
					valueArr.push(title);
					valueArr.push(synopsis);
				} else {
					const value = data$.text().trim();

					valueArr.push(value);
				}
			});

			const animeStr = headers.reduce((prev, current, index) => {
				prev[current as keyof AnimeString] = valueArr[index];
				return prev;
			}, {} as AnimeString);

			const anime: AnimeSlim = {
				...animeStr,
				score: Number(animeStr.score),
				malId: Number(animeStr.malId),
				episodeCount: Number(animeStr.episodeCount === '-' ? '-1' : animeStr.episodeCount)
			};

			result.push(anime);
		});

		return { currentPage, lastPage, data: result };
	}

	static getSearchParams(filter: Partial<SearchFilter>) {
		const params = new URLSearchParams();

		if (filter.query) params.set('q', filter.query);

		if (filter.page) {
			const animeShown = (filter.page - 1) * 50;
			params.set('show', animeShown.toString());
		}

		if (filter.sort) {
			const sortCol = sortKeys[filter.sort.type];
			const order = filter.sort.order === 'asc' ? 0 : 1;
			params.set('o', sortCol.toString());
			params.set('w', order.toString());
		}

		if (filter.genre) {
			filter.genre.forEach((genre) => {
				const id = genres[genre];
				params.append('genre[]', id.toString());
			});
		}

		if (filter.status) {
			const key = statusKeys[filter.status];
			params.set('status', key.toString());
		}

		const columns = ['a', 'b', 'c', 'g'];

		columns.forEach((col) => params.append('c[]', col));

		return params;
	}
}
