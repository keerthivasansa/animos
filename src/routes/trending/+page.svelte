<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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

<h1 class="my-10 mb-20 px-10 text-3xl font-extrabold">Trending Anime</h1>
<Pagination
	onPageChange={async (page) => {
		changePage(page);
	}}
	data={currentData}
/>
