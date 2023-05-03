import Jikan from '$lib/common/jikan';

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') || '1');
	const popular = await Jikan.getMostPopular(page);
	return {
		popular
	};
}
