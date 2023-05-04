<script lang="ts">
	import type { Anime } from '@tutkli/jikan-ts';
	import AnimeCard from '../cards/AnimeCard.svelte';

	export let animeList: Anime[];
	export let title: string;
</script>

<div class="wrapper">
	<h3 class="section-title">{title}</h3>
	<div class="flex gap-4 sm:gap-12 w-full flex-wrap">
		{#each animeList as anime (anime.mal_id)}
			<AnimeCard {anime} />
		{/each}
	</div>
</div>

<style lang="postcss">
	.section-title {
		@apply mb-10 text-2xl font-bold;
	}

	.wrapper {
		@apply px-2 sm:px-10 my-10;
	}
</style>
