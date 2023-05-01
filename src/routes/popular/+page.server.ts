import { MAL } from '$lib/common/mal';

export async function load({ url }) {
	const page = Number(url.searchParams.get('page') || '1');
	const popular = await MAL.getMostPopular(page);
	return {
		popular
	};
}
