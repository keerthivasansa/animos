<script lang="ts">
	import AnimeCard from '$lib/components/cards/AnimeCard.svelte';
	import AnimeBadges from '$lib/components/composite/AnimeBadges.svelte';
	import AnimeList from '$lib/components/composite/AnimeList.svelte';
	import TextClamp from '$lib/components/composite/TextClamp.svelte';
	import { getImageUrl, getTitle } from '$lib/utils/anime';
	import Icon from '@iconify/svelte';

	export let data;

	$: anime = data.anime;
	// $: recommendations = data.recommendations;
</script>

<svelte:head>
	<title>{anime.title} | animos</title>
</svelte:head>

<div class="px-20 py-5 flex-1 flex gap-20">
	<div class="my-20">
		<img src={anime.image} class="w-52 rounded-lg h-80 my-auto" alt={anime.title} />
	</div>
	<div class="my-10 flex flex-col gap-6">
		<span class="font-bold text-2xl">{anime.title}</span>
		<AnimeBadges {anime} size="large" />
		<div class="my-5 text-sm">
			<span class="text-gray-300">Type: </span>
			<span class="bg-blue-800 text-white px-2 py-1 rounded-md">{anime.type}</span>
		</div>
		<div class="max-w-2xl">
			<TextClamp lines={5}>
				<span class="text-sm">{anime.synopsis}</span>
			</TextClamp>
		</div>
		<a href="/anime/{anime.malId}/watch">
			<button
				class="flex gap-2 items-center bg-accent text-black px-4 py-2 rounded-md w-fit font-semibold"
				>Watch
				<Icon icon="material-symbols:play-circle-outline" width="24px" /></button
			>
		</a>
		<div class="my-4">
			<!-- <span class="text-lg font-semibold">More like this:</span>
			<div class="flex flex-wrap gap-5 my-4">
				{#each recommendations.data.slice(0, 5) as recAnime (recAnime.entry.mal_id)}
					<AnimeCard anime={recAnime.entry} />
				{/each}
			</div> -->
		</div>
	</div>
</div>
