<script lang="ts">
	import AnimeList from '$lib/components/composite/AnimeList.svelte';
	import TrendingCarousel from '$lib/components/composite/TrendingCarousel.svelte';

	export let data;

	const { trendingList, recommendations } = data;
</script>

<svelte:head>
	<title>animos | Watch anime in HD quality</title>
</svelte:head>

<TrendingCarousel {trendingList} />

<AnimeList title="Recommendations" animeList={recommendations.data} />
