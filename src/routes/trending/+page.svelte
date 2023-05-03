<script lang="ts">
	import Jikan from '$lib/common/jikan/index.js';
	import ImageHeader from '$lib/components/base/ImageHeader.svelte';
	import Pagination from '$lib/components/composite/Pagination.svelte';

	export let data;

	const { trending } = data;

	let currentData = trending;

	async function changePage(page: number) {
		currentData = await Jikan.getTrending(page);
	}
</script>

<ImageHeader
	image="https://media.kitsu.io/anime/44973/cover_image/46d59e2fa0087c76ad47d3bea7207391.jpg"
	title="Trending Anime"
/>
<Pagination
	onPageChange={async (page) => {
		changePage(page);
	}}
	data={currentData}
/>
