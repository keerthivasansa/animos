<script lang="ts">
	import type { EpisodeProvider } from '@prisma/client';
	import { onMount } from 'svelte';
	import Hls from 'hls.js';
	import Plyr from 'plyr';

	export let episode: EpisodeProvider;

	onMount(() => {
		if (!episode.source) {
			alert('Failed to get source of episode');
			return;
		}
		if (!Hls.isSupported()) {
			alert('Streaming HLS is not supported in your device!');
			return;
		}
		const hls = new Hls();
		hls.loadSource(episode.source);
		const element = document.getElementById('player') as HTMLVideoElement;
		hls.attachMedia(element);

		const plyr = new Plyr('#player');
		console.log(plyr);
	});
</script>

<div class="w-full max-w-3xl">
	<video src={episode.source} id="player" />
</div>
