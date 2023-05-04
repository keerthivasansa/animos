<script lang="ts">
	import { getAnimeRating } from '$lib/utils';
	import { AnimeStatus, type Anime } from '@tutkli/jikan-ts';
	import Badge from '../base/Badge.svelte';
	import Icon from '@iconify/svelte';

	export let anime: Anime;
	export let size: 'large' | 'small' = 'small';
</script>

<div class="flex gap-2 flex-wrap {size == 'small' ? 'text-xs' : 'text-base'}">
	{#if anime.status !== AnimeStatus.upcoming}
		{#if anime.episodes !== null}
			<Badge class="bg-amber-800">EP: {anime.episodes}</Badge>
		{/if}
		<Badge class="bg-red-800">{getAnimeRating(anime.rating)}</Badge>
		<Badge class="bg-yellow-800 flex gap-1 justify-center"
			>{anime.score}
			<Icon icon="material-symbols:star-rounded" width={size === 'small' ? '14px' : '21px'} /></Badge
		>
	{:else}
		<Badge class="bg-yellow-800">Upcoming</Badge>
	{/if}
</div>
