<script>
	import AnimeBadges from '$lib/components/composite/AnimeBadges.svelte';
	import TextClamp from '$lib/components/composite/TextClamp.svelte';
	import { getImageUrl, getTitle } from '$lib/utils/anime';
	import Icon from '@iconify/svelte';

	export let data;

	const { result } = data;

	const anime = result.data;

	const { imageUrl } = getImageUrl(anime);
	const title = getTitle(anime);
</script>

<div class="px-20 py-5 flex-1 flex gap-20">
	<div class="my-auto">
		<img src={imageUrl} class="w-52 rounded-lg h-80 my-auto" alt={anime.title} />
	</div>
	<div class="my-10 flex flex-col gap-6">
		<h1 class="font-bold">{title}</h1>
		<AnimeBadges {anime} size="large" />
		<TextClamp lines={6}>
			<p class="max-w-2xl">{anime.synopsis}</p>
		</TextClamp>
		<button class="flex gap-2 items-center bg-accent text-black px-4 py-2 rounded-md w-fit font-semibold"
			>Watch
			<Icon icon="material-symbols:play-circle-outline" width="24px"/></button
		>
	</div>
</div>
