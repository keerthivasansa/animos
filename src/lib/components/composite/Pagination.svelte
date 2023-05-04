<script lang="ts">
	import AnimeList from './AnimeList.svelte';
	import { DarkPaginationNav } from 'svelte-paginate';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Anime, JikanResponse } from '@tutkli/jikan-ts';

	export let onPageChange: (page: number) => Promise<void>;
	export let data: JikanResponse<Anime[]>;

	$: pageNo = Number($page.url.searchParams.get('page') || '1');
</script>

<AnimeList animeList={data.data} title="" />
<div class="absolute bottom-0 left-0 sm:left-20 w-full remaining-width">
	<DarkPaginationNav
		totalItems={(data.pagination?.last_visible_page || 0) * 25}
		pageSize={25}
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
</div>

<style>
	@media (min-width: 640px) {
		.remaining-width {
			width: calc(100% - 5rem);
		}
	}
</style>
