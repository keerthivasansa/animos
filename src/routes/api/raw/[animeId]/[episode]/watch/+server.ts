import providers, { type AvailableProvider } from '@server/providers/index.js';
import { AnimeService } from '@server/services/anime/index.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ params, url }) => {
	const { animeId, episode } = params;
	const provider = url.searchParams.get('provider');

	const malId = Number(animeId);
	const anime = new AnimeService(malId);
	if (provider && !Object.keys(providers).includes(provider))
		return new Response('The supplied `provider` does not exist or is disabled.', { status: 400 });
	else if (provider) anime.setProvider(provider as AvailableProvider);
	const source = await anime.getSource(episode);
	return json(source);
};
