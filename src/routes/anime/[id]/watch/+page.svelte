<script lang="ts">
	import EpisodePlayer from '$lib/components/composite/EpisodePlayer.svelte';
	import { getTitle } from '$lib/utils/anime.js';
	import type { EpisodeProvider } from '@prisma/client';

	export let data;

	$: ({ episodes, current, anime, malEpisodes } = data);

	function getEpisodeTitle(ep: EpisodeProvider, includeNumber = true) {
		const malEpisode = malEpisodes.data.find((malEp) => malEp.mal_id === ep.episodeNumber);
		if (malEpisode) {
			if (!includeNumber) return malEpisode.title;
			return `${ep.episodeNumber}: ${malEpisode.title}`;
		}
		return ep.title || ep.episodeNumber;
	}

	$: animeTitle = getTitle(anime.data);

	let epPage: number;
	
	// const totalEpisodePages = Math.ceil(anime.data.episodes / 30);
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
	<title>Watch {animeTitle} in animos</title>
</svelte:head>

<div class="flex gap-6 px-10 overflow-hidden">
	<div class="py-10 w-full">
		<EpisodePlayer episode={current} />
		<div class="my-4">
			<a href="/anime/{anime.data.mal_id}">
				<small class="text-gray-400">{animeTitle} / Episode {current.episodeNumber}</small></a
			>
			<h5 class="font-semibold">
				{getEpisodeTitle(current, false)}
			</h5>
		</div>
	</div>
	<div>
		<div class="my-2">
			<select>
				{#each Array.from({ length: 10 }) as _, index}
					<option>{index * 30} - {(index + 1) * 30}</option>
				{/each}}
			</select>
		</div>
		<div class="py-4 flex flex-wrap max-w-md h-full">
			{#each episodes as ep (ep.id)}
				<a href="/anime/{anime.data.mal_id}/watch?episode={ep.episodeNumber}" class="w-full">
					<button
						class="border-2 min-w-[200px] text-sm border-gray-500 w-full py-4 text-start px-10 text-gray-300 my-3 rounded-md"
					>
						{getEpisodeTitle(ep)}
					</button>
				</a>
			{/each}
		</div>
	</div>
</div>
