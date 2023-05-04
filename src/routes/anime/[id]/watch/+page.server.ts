import Jikan from '$lib/common/jikan/index.js';
import EpisodeService from '@server/services/episode/index.js';
import { redirect } from '@sveltejs/kit';

export async function load({ params, url }) {
	const { id } = params;
	const episode = url.searchParams.get('episode');
	console.log('child load');
	const malId = Number(id);
	const episodeService = new EpisodeService(malId);
	const episodes = await episodeService.getEpisodes();
	console.log(episodes);
	const ep = episode
		? episodes.find((ep) => ep.episodeNumber === Number(episode))
		: episodes.shift();
	if (!ep) throw redirect(307, `/anime/${id}`);
	const current = await episodeService.getSource(ep.episodeProviderId);
	const anime = await Jikan.getAnime(malId);
	const malEpisodes = await Jikan.getEpisodes(malId);
	return { episodes, current, anime, malEpisodes };
}
