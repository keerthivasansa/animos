<script lang="ts">
	import { navigating } from '$app/stores';

	let delayTimer: NodeJS.Timer | null;
	let progressInterval: NodeJS.Timer | null;
	let progress = 0;

	function reset() {
		progress = 0;
		if (delayTimer) clearInterval(delayTimer);
		if (progressInterval) clearInterval(progressInterval);
	}

	function startTimer() {
		if (delayTimer) {
			clearTimeout(delayTimer);
			delayTimer = null;
		}
		// proceed to show progress bar
		progress = 15;
		progressInterval = setInterval(() => {
			const val = progress + 15;
			console.log({ val });
			if (val > 80 && progressInterval) clearInterval(progressInterval);
			else progress = val;
		}, 450);
	}

	navigating.subscribe((val) => {
		reset();
		if (val) {
			delayTimer = setTimeout(startTimer, 250); // only show progress bar when the page takes a few seconds to load
		}
	});
</script>

<div class="w-screen bg-transparent h-1">
	{#if progress}
		<div
			class="bg-amber-600 h-1 transition-[width] ease-linear duration-[5000ms]"
			style="width: {progress}%"
		/>
	{/if}
</div>
