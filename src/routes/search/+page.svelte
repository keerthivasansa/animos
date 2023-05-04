<script lang="ts">
	import { page } from '$app/stores';
	import Jikan from '$lib/common/jikan';
	import Pagination from '$lib/components/composite/Pagination.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: q = $page.url.searchParams.get('q') || '';
	$: pageNo = Number($page.url.searchParams.get('page') || '1');

	const { result } = data;
	let currentData = result;

	$: (async (q: string, pageNo: number) => {
		currentData = await Jikan.getSearch(q, pageNo);
	})(q, pageNo);

	async function changePage(page: number) {
		currentData = await Jikan.getSearch(q, page);
	}
</script>

<h4 class="pt-10 pb-5 px-3 sm:px-10 font-bold">Searching for "{q}"</h4>
{#if currentData}
	<Pagination data={currentData} onPageChange={changePage} />
{/if}
