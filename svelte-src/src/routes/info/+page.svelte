<script lang="ts">
	import { page } from '$app/stores';

	let animeId: number;
	let episodeRange: number[][] = [];
	let currentRange = 0;
	let jumpEp = '0';

	function generateRange(end: number) {
		let arr = [];
		for (let i = 1; i <= end; i++) {
			arr.push(i);
		}
		return arr;
	}

	function jumpToEp() {
		let ep = parseInt(jumpEp.toString());
		for (let i = 0; i < episodeRange.length; i++) {
			let range = episodeRange[i];
			console.log(range);
			if (range[0] <= ep && ep <= range[1])
				currentRange = i;
		}
	}

	function range(from:number, to:number) {
		let arr = [];
		for (let i = from; i <= to; i++)
			arr.push(i);
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
		if (res.totalEpisodes > 100) {
		let noOfRanges = Math.floor(res.totalEpisodes / 100);
		for (let i = 0; i < noOfRanges; i++) {
			episodeRange.push([i * 100 + 1, i * 100 + 99]);
		}
		episodeRange.push([
			noOfRanges * 100 + 1,
			noOfRanges * 100 + (res.totalEpisodes % 100),
		]);
		}
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
				{#if anime.totalEpisodes < 100}
				{#each generateRange(anime.totalEpisodes) as ep}
					<a
						class="text-center p-2 rounded-md bg-slate-100 text-black w-10 h-10"
						href="/episode?episodeId={ep}&animeId={animeId}"
					>
						{ep}
					</a>
				{/each}
				{:else}
					<div class="flex gap-4 center ">
						<select bind:value={currentRange} class="rounded-md bg-slate-800">
							{#each episodeRange as range, index (index)}
								<option value={index}>{range[0]} - {range[1]}</option>
							{/each}
						</select>
						<label>Jump to episode: <input type="number" max={anime.totalEpisodes} class="w-20 bg-slate-800 rounded-md" on:input={ _=> jumpToEp() } bind:value={jumpEp} > </label>
						<a href="/episode?episodeId={jumpEp}&animeId={animeId}">
							<button class="px-8 rounded-md bg-slate-200 text-black py-2">Go</button>
						</a>
					</div>
					<div class="flex gap-4 flex-wrap my-10">
						{#each range(episodeRange[currentRange][0], episodeRange[currentRange][1]) as index}
							<a style="min-width: 2.5rem;" class="bg-slate-200 text-black p-2 rounded-md text-center" href="/episode?episodeId={index}&animeId={animeId}">
								{index}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/await}
</section>
