import { MAL } from '@server/helpers/mal';

export const ssr = false;

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') || '1');
	const trending = await MAL.getTrending(page);
	return {
		trending
	};
}
