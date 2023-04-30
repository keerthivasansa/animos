<script lang="ts">
	import type { Anime } from '@prisma/client';
	import type { AnimeSlim } from '@server/helpers/mal/search';
	import AnimeList from './AnimeList.svelte';
	import { DarkPaginationNav } from 'svelte-paginate';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let onPageChange: (page: number) => Promise<void>;
	export let data: { currentPage: number; lastPage: number; data: (Anime | AnimeSlim)[] };

	$: pageNo = Number($page.url.searchParams.get('page') || '1');
</script>

<AnimeList animeList={data.data} title="" />
<DarkPaginationNav
	totalItems={data.lastPage * 50}
	pageSize={50}
	currentPage={pageNo}
	limit={1}
	showStepOptions={true}
	on:setPage={(e) => {
		const newPage = e.detail.page;
		$page.url.searchParams.set('page', newPage.toString());
        pageNo = newPage;
		goto(location.pathname + '?' + $page.url.searchParams.toString());
		onPageChange(newPage);
	}}
/>
