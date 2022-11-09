<script lang="ts">
  import Carousel from '../lib/components/Carousel.svelte';

	import { Rating } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { CardPlaceholder, Popover } from 'flowbite-svelte';

	let popularAnime: AnimePopular[] = [];

	async function getPopular() {
		return window.api.popularAnime();
	}
	
	async function getLastPlayed() {
		return window.api.getLastPlayed()
	}

	onMount(async () => {
		console.log(popularAnime);
		console.log("Last played:");
		console.log(await getLastPlayed())
	});
</script>


<!-- The cards are not live, here as a template -->
<Carousel anime={[
	{img:"https://images7.alphacoders.com/418/418724.png", title:"Attack on Titan"},
{img:"https://images3.alphacoders.com/111/thumb-1920-1116286.jpg", title:"Jujutsu Kaisen"},
	{img:"https://wallpaperaccess.com/full/17350.jpg", title:"One piece"},
	{img:"https://i.pinimg.com/originals/25/0f/b6/250fb6cc8daf145c13901b0f107260ee.jpg", title:"My Hero Academia"}
]}></Carousel>


{#await getLastPlayed()}
	<p></p>
{:then result} 
	<section>
		<h1 class="text-3xl font-black mx-10">Continue Watching</h1>
		<div class="flex gap-16 mx-10 my-10">
			{#each result as episode}
				<a href="/episode?animeId={episode.animeId}&episodeId={episode.episodeId}">
					<div class="whitespace-nowrap flex flex-col gap-3">
						<img src={episode.anime.img} class="h-60 object-cover rounded-md" alt={episode.anime.title}>
						<span class="text-xl text-ellipsis overflow-hidden font-bold w-40" style=" display: inline-block;overflow: hidden;white-space: nowrap;">{episode.anime.title}</span>
						<span class="text-sm text-slate-400">Episode {episode.episodeId}</span>
						<div class="w-full rounded-lg bg-slate-600 h-2 relative">
							<div class="h-full rounded-lg bg-white" style="width:{parseInt(((episode.watchTime / episode.length) * 100).toString())}%"></div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>
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
					<a href="/" id="anime-{anime.mal_id}">
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
