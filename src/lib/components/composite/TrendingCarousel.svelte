<script lang="ts">
	import type { Anime } from '@prisma/client';
	import Carousel from './Carousel.svelte';
	import type { AnimeSlim } from '@server/helpers/mal/search';

	export let trendingList: {
        malId: number;
        poster: string;
        index: number;
        anime: AnimeSlim;
    }[];
</script>

<Carousel>
	{#each trendingList as trending (trending.anime.malId)}
		<swiper-slide class="relative">
			<img
				src={trending.poster}
				alt={trending.anime.title}
			/>
            <div class="info w-full h-full px-10 py-12 bg-black bg-opacity-75 rounded-lg absolute top-0 left-0 hover:opacity-100 opacity-0 transition-[opacity] ease-linear duration-200">
                <span class="text-3xl font-bold">{trending.anime.title}</span>
                <p class="mt-12 max-w-md">{trending.anime.synopsis}</p>
            </div>
		</swiper-slide>
	{/each}
</Carousel>

<style>
	swiper-slide > img {
		border-radius: 12px;
		object-fit: cover;
        width: 100%;
        height: 100%;
	}

	swiper-slide {
		width: 100%;
		height: 24rem;
		background: white;
		border-radius: 12px;
	}
</style>
