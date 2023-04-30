<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ImageHeader from '$lib/components/base/ImageHeader.svelte';
	import Pagination from '$lib/components/composite/Pagination.svelte';
	import axios from 'axios';

	export let data;

	const { trending } = data;

	let currentData = trending;

	async function changePage(page: number) {
		const result = await axios.get('/api/anime/trending', {
			params: { page }
		});
		currentData = result.data;
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
