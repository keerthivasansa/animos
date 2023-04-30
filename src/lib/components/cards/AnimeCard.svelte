<script lang="ts">
	import TextClamp from '../composite/TextClamp.svelte';
	import type { AnimeSlim } from '@server/helpers/mal/search';
	import Badge from '../base/Badge.svelte';
	import Icon from '@iconify/svelte';

	export let anime: AnimeSlim;

	let openOnRight = false;
</script>

<div
	id={`card-${anime.malId}`}
	class="w-40 flex flex-col parent relative hover:nth cursor-pointer rounded-md"
>
	<div class="overflow-hidden rounded-md content">
		<img src={anime.image} alt={anime.title} class="w-40 h-56" />
		<div class="text-center bg-black py-3">
			<TextClamp lines={1}>
				<div class="px-4 text-xs font-semibold">{anime.title}</div>
			</TextClamp>
		</div>
	</div>
	<div
		class="w-40 sm:w-60 h-full p-4 gap-6 flex translate-x-0 left-0 text-sm -z-10 rounded-r-md transition-all duration-700 info top-0 absolute flex-col bg-black"
		class:openOnRight
	>
		<TextClamp lines={2}>
			{anime.title}
		</TextClamp>
		<div class="flex gap-2 flex-wrap">
			<Badge class="bg-amber-800">EP: {anime.episodeCount}</Badge>
			<Badge class="bg-red-800">{anime.rating}</Badge>
			<Badge class="bg-yellow-800 flex gap-1 justify-center"
				>{anime.score} <Icon icon="material-symbols:star-rounded" width="14px" /></Badge
			>
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

	.parent:hover > .info.openOnRight {
		@apply -translate-x-40;
	}
</style>
