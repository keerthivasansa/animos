<script lang="ts">
	import ImageHeader from '$lib/components/base/ImageHeader.svelte';
	import Pagination from '$lib/components/composite/Pagination.svelte';
	import axios from 'axios';

	export let data;

	const { popular } = data;

	let currentData = popular;

	const ATTACK_ON_TITAN_COVER = 'https://media.kitsu.io/anime/cover_images/8671/original.png';

	async function changePage(page: number) {
		const result = await axios.get('/api/anime/popular', {
			params: { page }
		});
		currentData = result.data;
	}
</script>

<ImageHeader image={ATTACK_ON_TITAN_COVER} title="Most Popular" />

<Pagination
	onPageChange={async (page) => {
		changePage(page);
	}}
	data={currentData}
/>
