import Jikan from '$lib/common/jikan/index.js';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
    const q = url.searchParams.get('q') || '';
    const page = url.searchParams.get('page') || '1';
    if (!q)
        return redirect(307, "/");
    const result = await Jikan.getSearch(q, Number(page));
    return {
        result
    }
}