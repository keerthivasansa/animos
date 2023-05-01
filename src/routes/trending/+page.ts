import { MAL } from '$lib/common/mal';

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') || '1');
	const trending = await MAL.getTrending(page);
	return {
		trending
	};
}
