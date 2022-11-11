<script lang="ts">
	import { page } from '$app/stores';

	let animeId: number;

	function generateRange(end: number) {
		let arr = [];
		for (let i = 1; i <= end; i++) {
			arr.push(i);
		}
		return arr;
	}

	async function getAnime() {
		let id = $page.url.searchParams.get('animeId');
		console.log("Feching details for animeId:", id)
		if (!id) {
			location.href = '/';
			id = '';
		}
		animeId = parseInt(id);
		let res = await window.api.animeInfo(animeId);
		console.log(res);
		return res;
	}
</script>

<section>
	{#await getAnime()}
		Loading info
	{:then anime}
		<div class="flex gap-14 justify-center">
			<img src={anime.img} class="h-max rounded-lg" alt={anime.title} />
			<div style="width:36rem" class="flex flex-col gap-4">
				<h1 class="text-3xl font-bold">{anime.title}</h1>
				<br />
				<span>
					<b>Status:</b>
					{anime.status}
				</span>
				<p>{anime.synopsis}</p>
			</div>
		</div>
		<div class="flex my-10 flex-col gap-5 center">
			<h2 class="font-bold">Episodes</h2>
			<div class="flex gap-2 flex-wrap max-w-xl">
				{#each generateRange(anime.totalEpisodes) as ep}
					<a
						class="text-center p-2 rounded-md bg-slate-100 text-black w-10 h-10"
						href="/episode?episodeId={ep}&animeId={animeId}"
					>
						{ep}
					</a>
				{/each}
			</div>
		</div>
	{/await}
</section>
