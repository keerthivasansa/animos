<script lang="ts">
	import { page } from '$app/stores';
	import { Skeleton } from 'flowbite-svelte';

	let keyword = '. . .';

	async function getSearch() {
		let query = $page.url.searchParams.get('keyw');
		if (!query) {
			console.log('no search');
			query = '';
		}
		keyword = query;
		let result = await window.api.search(query);
		console.log(result);
		return result;
	}
</script>

<section>
	<h1 class="text-3xl font-black dark:text-white">
		Search: {keyword}
	</h1>
	<div class="flex my-10 gap-5 flex-wrap">
		{#await getSearch()}
			<div class="m-6">
				<Skeleton />
			</div>
		{:then results}
			{#each results as anime (anime.malId)}
				<a href="/info?animeId={anime.malId}">
					<div class="flex flex-col gap-3 w-40">
						<img
							src={anime.img}
							class="rounded-lg hover:scale-105 transition-all ease-linear duration-200 h-52 w-40"
							alt={anime.title}
						/>
						<h4 class="text-md">{anime.title}</h4>
					</div>
				</a>
			{/each}
		{/await}
	</div>
</section>
