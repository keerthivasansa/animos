<script lang="ts">
	import TrendingCarousel from '$lib/components/composite/TrendingCarousel.svelte';

	export let data;

	const { trendingList } = data;
</script>

<TrendingCarousel {trendingList} />
