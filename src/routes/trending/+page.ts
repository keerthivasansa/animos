import Jikan from '$lib/common/jikan/index.js';

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') || '1');
	const trending = await Jikan.getTrending(page);
	return {
		trending
	};
}
