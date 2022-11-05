<script lang="ts">
	import { Rating } from "flowbite-svelte"
	import { onMount } from "svelte";
	import { CardPlaceholder, Popover } from 'flowbite-svelte'

	let popularAnime:AnimePopular[] = []

	async function getPopular() {
		return window.api.popularAnime();
	}

	onMount(async () => {
		console.log(popularAnime)
	})
</script>


	<section>
		<h1 class="text-3xl mx-10 font-black">Trending Anime:</h1>
		<div class="my-10 flex gap-4 flex-wrap items-center justify-center" data-sveltekit-prefetch="off">
			{#await getPopular()}
				<CardPlaceholder/>
			{:then popularAnime} 
				{#each popularAnime as anime}
					<div class='flex flex-col gap-5 '>
						<a href="/" id="anime-{anime.mal_id}">
							<div>
								<img src={anime.animeImg} class="object-cover cursor-pointer hover:scale-105 transition-all ease-linear h-64 rounded-md" alt="{anime.animeTitle}"/>
					
							</div>
					</a>
					</div>
					<Popover triggeredBy="#anime-{anime.mal_id}">
						<div class="flex flex-col gap-2 px-3 py-2 text-white rounded-md">
							<b class="text-white">{anime.animeTitle}</b>
							<Rating count rating={anime.score} ></Rating>
							<span>{anime.views} views</span>
						</div>
					</Popover>
				{/each}
			{/await}
		</div>
	</section>
