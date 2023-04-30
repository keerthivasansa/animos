<script lang="ts">
	import AnimeCard from '$lib/components/cards/AnimeCard.svelte';
	import AnimeList from '$lib/components/composite/AnimeList.svelte';
	import TrendingCarousel from '$lib/components/composite/TrendingCarousel.svelte';

	export let data;

	const { trendingList, recommendations } = data;
</script>

<TrendingCarousel {trendingList} />

<AnimeList title="Recommendations" animeList={recommendations.map((data) => data.anime)} />
