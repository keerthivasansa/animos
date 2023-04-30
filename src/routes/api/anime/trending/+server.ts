import { MAL } from '@server/helpers/mal/index.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const page = Number(url.searchParams.get('page') || '1');
    const result = await MAL.getTrending(page);
    return json(result);
}