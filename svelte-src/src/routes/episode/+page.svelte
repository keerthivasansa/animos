<script lang="ts">
	import { page } from '$app/stores';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import type { Episode } from 'prisma/prisma-client';
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte';
	import { onMount } from 'svelte';
	import { Progressbar } from 'flowbite-svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	let animeId: number;
	let updateVideoLength = false;
	let episodeId: number;
	let result: {
		currentEp: Episode;
		allEpisodes: Episode[];
	};
	let currentSrc = '';

	enum State {
		Loading,
		Finished
	}

	let pageState: State = State.Loading;

	async function fetchEpisodeSrc() {
		let params = $page.url.searchParams;
		let episodeTempId = params.get('episodeId');
		let animeTempId = params.get('animeId');
		if (!animeTempId || !episodeTempId) {
			location.href = '/';
			animeTempId = episodeTempId = '';
		}
		animeId = parseInt(animeTempId);
		episodeId = parseInt(episodeTempId);

		console.log({ episodeId, animeId });
		console.time('new anime');
		let allEpisodes = await window.api.getEpisodes(animeId);
		let src = await window.api.getEpisode(animeId, episodeId);
		console.timeEnd('new anime');
		if (!src.length)
			updateVideoLength = true;
		result = {
			currentEp: src,
			allEpisodes
		};
		currentSrc = result.currentEp.source ?? '';
		console.dir(result);
		pageState = State.Finished;
	}

	function goToEp(epNo: number) {
		location.replace(`/episode?animeId=${animeId}&episodeId=${epNo}`);
	}

	onMount(fetchEpisodeSrc);
</script>

<section class="flex justify-between px-4">
	<div class="aspect-video rounded-lg fixed w-240">
		{#if pageState == State.Loading}
			<div
				style="width: 60rem;"
				class="animate-pulse aspect-video flex center bg-slate-700 rounded-lg"
			>
				<div class="w-10 text-slate-400">
					<FaPlay />
				</div>
			</div>
			<div class="mx-5 my-4">
				<div class="animate-pulse bg-slate-700 w-52 h-10 rounded-lg" />
			</div>
		{:else}
			<VideoPlayer src={currentSrc} updateVideoLength={updateVideoLength} animeMalId={animeId} {episodeId} />
			<div class="mx-5 my-4">
				<h3 class="text-xl font-bold">{result.currentEp.title}</h3>
				<br />
				<div class="text-xs font-semibold">
					<button
						on:click={(_) => (currentSrc = result.currentEp.source ?? '')}
						class="px-3 py-2 rounded-md {currentSrc == result.currentEp.source
							? 'bg-green-800 text-white'
							: 'bg-slate-400 text-black'}">GOGO</button
					>
					<button
						on:click={(_) => (currentSrc = result.currentEp.sourceBackup ?? '')}
						class="px-3 mx-2 py-2 rounded-md {currentSrc == result.currentEp.sourceBackup
							? 'bg-green-800 text-white'
							: 'bg-slate-400 text-black'}text-black">GOGO-BK</button
					>
				</div>
			</div>
		{/if}
	</div>
	<div class="episodes-container" style="margin-left: 65rem;">
		<div class="my-14" style="width: 24rem;">
			<h3 class="text-2xl font-bold">Episodes</h3>
			<div class="flex gap-4 my-5 flex-col episode-wrapper">
				{#if pageState != State.Loading}
					{#each result.allEpisodes as ep (ep.episodeId)}
						<button
							style="{ep.episodeId == result.currentEp.episodeId ? "border: 1px solid var(--accent-color);"  : ""}"
							class="cursor-pointer text-left border-slate-400 border-2 rounded-md my-2 px-3 py-2 { (ep.episodeId != result.currentEp.episodeId && ep.watchTime / (ep.length ?? -1)) > 0.91 ? "opacity-40" : ""}"
							on:click={(_) => goToEp(ep.episodeId)}
							>
							<span class="my-4">{ep.episodeId}. {ep.title}</span>
							{#if ep.length}
								<div class="my-2">
									<ProgressBar value={ep.watchTime} max={ep.length} />
								</div>
								<!-- <ProgressBar value={ep.watchTime} max={ep.length} /> -->
							{/if}

						</button>
						
					{/each}
				{:else}
					{#each Array.from({ length: 10 }) as _}
						<div class="bg-slate-700 h-8 rounded-md animate-pulse my-2 px-3 py-2" />
					{/each}
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.episodes-container {
		height: 100%;
		overflow-y: auto;
	}

	.w-240 {
		max-width: 60rem;
		max-height: 34rem;
	}
</style>
