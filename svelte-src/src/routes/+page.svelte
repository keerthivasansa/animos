<script lang="ts">
	import Carousel from '../lib/components/Carousel.svelte';
	import { Rating } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { CardPlaceholder, Popover } from 'flowbite-svelte';
	import ContinueSlider from '$lib/components/ContinueSlider.svelte';
	import { applyAction } from '$app/forms';

	let popularAnime: AnimePopular[] = [];

	async function getPopular(): Promise<AnimePopular[]> {
		let popular = await window.api.popularAnime();
		console.log('Popular');
		console.log(popular);
		return popular;
	}

	async function getLastPlayed() {
		return window.api.getLastPlayed();
	}

	async function getPosters() {
		let posters = await window.api.getPoster();
		console.log('posters:');
		console.log(posters);
		return posters;
	}

	onMount(async () => {
		console.log(popularAnime);
		console.log('Last played:');
		console.log(await getLastPlayed());
	});
</script>

{#await getPosters()}
	<span />
{:then result}
	{#if result.length > 0}
		<Carousel anime={result} />
	{/if}
{/await}

{#await getLastPlayed()}
	<p />
{:then result}
	{#if result.length > 0}
		<section>
			<h1 class="text-3xl font-black mx-10">Continue Watching</h1>
			<ContinueSlider anime={result} />
		</section>
	{/if}
{/await}

<section class="px-0">
	<h1 class="text-3xl mx-10 font-black">Trending Anime:</h1>
	<div class="my-10 flex gap-4 flex-wrap items-center justify-center" data-sveltekit-prefetch="off">
		{#await getPopular()}
			<CardPlaceholder />
		{:then popularAnime}
			<!-- //	TODO each card on hover with a delay should scale with ease, then info should slide from side -->
			{#each popularAnime as anime}
				<div class="flex flex-col gap-5 ">
					<a href="/info?animeId={anime.mal_id}" id="anime-{anime.mal_id}">
						<div>
							<img
								src={anime.animeImg}
								class="object-cover cursor-pointer hover:scale-105 transition-all ease-linear h-64 rounded-md"
								alt={anime.animeTitle}
							/>
						</div>
					</a>
				</div>
				<Popover triggeredBy="#anime-{anime.mal_id}">
					<div class="flex flex-col gap-2 px-3 py-2 text-white rounded-md">
						<b class="text-white">{anime.animeTitle}</b>
						<Rating count rating={anime.score} />
						<span>{anime.views} views</span>
					</div>
				</Popover>
			{/each}
		{/await}
	</div>
</section>
