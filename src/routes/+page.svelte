<script lang="ts">
	import TrendingCarousel from '$lib/components/composite/TrendingCarousel.svelte';

	const anime = {
		image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawCwhzhi96X.jpg',
		title: 'Death note apefokawe faefonawefja wefjka wefjaw efjwae'
	};

	export let data;

	const { trendingList } = data;
</script>

<div class="swiper">
	<TrendingCarousel {trendingList} />
</div>

<style>
	.swiper {
		padding: 16px 12px;
	}
</style>
