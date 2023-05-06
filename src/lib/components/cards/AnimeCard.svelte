<script lang="ts">
	import TextClamp from '../composite/TextClamp.svelte';
	import { onMount } from 'svelte';
	import { getImageUrl, getTitle, isFullAnime } from '$lib/utils/anime';
	import AnimeBadges from '../composite/AnimeBadges.svelte';
	import type { Anime, RecommendationEntry } from '@tutkli/jikan-ts';

	export let anime: Anime | RecommendationEntry;

	let openOnLeft = false;
	let element: HTMLDivElement;

	const { imageUrl, noImage } = getImageUrl(anime);
	const title = getTitle(anime);
	const fullAnime = isFullAnime(anime);

	onMount(() => {
		console.log(anime);
		openOnLeft = element.offsetLeft + element.offsetWidth * 2.5 > window.innerWidth;
	});
</script>

<div
	id={`card-${anime.mal_id}`}
	bind:this={element}
	class="w-40 flex flex-col parent relative hover:nth cursor-pointer rounded-md"
>
	<a href="/anime/{anime.mal_id}">
		<div class="overflow-hidden rounded-md content">
			<img
				src={imageUrl}
				alt={anime.title}
				class="w-40 h-56 object-contain bg-black"
				class:img-cover={noImage}
			/>
			<div class="text-center bg-black py-3">
				<TextClamp lines={1}>
					<div class="px-4 text-xs font-semibold">{title}</div>
				</TextClamp>
			</div>
		</div>
	</a>
	{#if fullAnime.fullAnime}
		{@const result = fullAnime.anime}
		<div
			class="w-44 sm:w-60 h-full p-4 gap-6 flex translate-x-0 left-0 text-sm -z-10 rounded-r-md transition-all duration-700 info top-0 absolute flex-col bg-black"
			class:openOnLeft
		>
			<TextClamp lines={2}>
				{title}
			</TextClamp>
			<AnimeBadges anime={result} />
			<TextClamp lines={4}>
				<span class="text-gray-300 text-xs">
					{result.synopsis}
				</span>
			</TextClamp>
		</div>
	{/if}
</div>

<style lang="postcss">
	.parent:hover {
		@apply rounded-l-md;
	}

	.parent:hover > .info {
		@apply translate-x-40 z-10;
	}

	.parent:hover > .info.openOnLeft {
		@apply -translate-x-44 sm:-translate-x-60;
	}

	.img-cover {
		@apply object-cover;
	}
</style>
