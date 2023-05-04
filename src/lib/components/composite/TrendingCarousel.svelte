<script lang="ts">
	import { Swipe, SwipeItem } from 'svelte-swipe';
	import { onDestroy } from 'svelte';
	import TextClamp from './TextClamp.svelte';
	import type { Anime } from '@prisma/client';

	export let trendingList: {
		malId: number;
		poster: string;
		index: number;
		anime: Anime;
	}[];

	let nextItemFn: () => void;
	let pauseAutoPlay = true;

	const slideTimer = setInterval(() => {
		if (pauseAutoPlay) return;
		nextItemFn();
	}, 6000);

	onDestroy(() => {
		clearInterval(slideTimer);
	});
</script>

<div
	class="w-full p-0 swipe-container"
	on:focus={() => (pauseAutoPlay = true)}
	on:blur={() => (pauseAutoPlay = false)}
	on:mouseenter={() => (pauseAutoPlay = true)}
	on:mouseleave={() => (pauseAutoPlay = false)}
>
	<Swipe showIndicators allow_infinite_swipe bind:nextItem={nextItemFn} transitionDuration={500}>
		{#each trendingList as trending (trending.anime.malId)}
			<SwipeItem>
				<div class="relative w-full h-full slide">
					<img src={trending.poster} alt={trending.anime.title} />
					<div
						class="info w-full flex flex-col gap-2 sm:gap-4 items-start justify-end h-full px-4 sm:px-10 py-12 sm:py-20 absolute bottom-0 left-0"
					>
						<TextClamp lines={1}>
							<span class="text-2xl sm:text-3xl font-bold">{trending.anime.title}</span>
						</TextClamp>

						<TextClamp lines={2}>
							<div class="max-w-md">
								<span class=" text-sm sm:text-base text-gray-300">{trending.anime.synopsis}</span>
							</div>
						</TextClamp>
					</div>
				</div>
			</SwipeItem>
		{/each}
	</Swipe>
</div>

<style lang="postcss">
	.swipe-container {
		@apply h-60 sm:h-[32rem];
	}

	.slide > img {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	.slide {
		@apply h-60 sm:h-[32rem] w-full;
		background: white;
	}

	.info {
		background: linear-gradient(0deg, black, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
	}
</style>
