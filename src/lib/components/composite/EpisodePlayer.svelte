<script lang="ts">
	import type { EpisodeProvider } from '@prisma/client';
	import Hls from 'hls.js';
	import Plyr from 'plyr';
	import { onDestroy, onMount } from 'svelte';

	export let episode: EpisodeProvider;
	let htmlVideo: HTMLVideoElement;

	let currentPlayer: {
		hls: Hls | null;
		plyr: Plyr | null;
	} = {
		hls: null,
		plyr: null
	};

	$: {
		if (!episode.source) throw new Error('Source empty. EP: ' + episode.episodeNumber);
		console.log('hls not init')
		if (currentPlayer.hls !== null) {
			currentPlayer.hls.loadSource(episode.source);
			currentPlayer.hls.on(Hls.Events.MANIFEST_PARSED, () => {
				currentPlayer.hls?.attachMedia(htmlVideo);
			});
		}
	}

	onMount(() => {
		currentPlayer.hls = new Hls();
		currentPlayer.plyr = new Plyr(htmlVideo, {
			 
		});
	});

	onDestroy(() => {
		if (currentPlayer.plyr) currentPlayer.plyr.destroy();
		if (currentPlayer.hls) currentPlayer.hls.destroy();
	});
</script>

<div class="w-full max-w-3xl" id="player-container">
	<video controls id="player" class="bg-black h-full w-full" bind:this={htmlVideo} />
</div>
