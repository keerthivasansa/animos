<script lang="ts">
	import TextClamp from '../composite/TextClamp.svelte';
	import Badge from '../base/Badge.svelte';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { AnimeStatus, type Anime } from '@tutkli/jikan-ts';
	import { getAnimeRating } from '$lib/utils';

	export let anime: Anime;

	let openOnLeft = false;
	let element: HTMLDivElement;

	const MAL_NO_IMAGE_URL = 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png';
	const NO_IMAGE_URL =
		'https://img.freepik.com/premium-photo/3d-square-ceramic-black-tile-white-grout-background-decor-modern-home-kitchen-wall_73274-609.jpg';

	let imageUrl: string;
	let noImage = false;

	if (anime.images.jpg.image_url !== MAL_NO_IMAGE_URL) {
		imageUrl = anime.images.webp?.image_url || anime.images.jpg.image_url;
	} else {
		imageUrl = NO_IMAGE_URL;
		noImage = true;
	}

	const title = anime.title_english || anime.title;
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
	<div
		class="w-44 sm:w-60 h-full p-4 gap-6 flex translate-x-0 left-0 text-sm -z-10 rounded-r-md transition-all duration-700 info top-0 absolute flex-col bg-black"
		class:openOnLeft
	>
		<TextClamp lines={2}>
			{title}
		</TextClamp>
		<div class="flex gap-2 flex-wrap">
			{#if anime.status !== AnimeStatus.upcoming}
				{#if anime.episodes !== null}
					<Badge class="bg-amber-800">EP: {anime.episodes}</Badge>
				{/if}
				<Badge class="bg-red-800">{getAnimeRating(anime.rating)}</Badge>
				<Badge class="bg-yellow-800 flex gap-1 justify-center"
					>{anime.score} <Icon icon="material-symbols:star-rounded" width="14px" /></Badge
				>
			{:else}
				<Badge class="bg-yellow-800">Upcoming</Badge>
			{/if}
		</div>
		<TextClamp lines={4}>
			<span class="text-gray-300 text-xs">
				{anime.synopsis}
			</span>
		</TextClamp>
	</div>
</div>

<style lang="postcss">
	.parent:hover {
		@apply rounded-l-md;
	}

	.parent:hover > .content {
		@apply z-20;
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
