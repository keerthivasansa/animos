<script lang="ts">
	import { navigating } from '$app/stores';

	let delayTimer: NodeJS.Timer | null;
	let progressInterval: NodeJS.Timer | null;
	let progress = 0;

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
		progress = 0;
		if (val) {
			delayTimer = setTimeout(startTimer, 1000); // only show progress bar when the page takes a few seconds to load
		} else if (delayTimer) {
			clearTimeout(delayTimer);
		} else if (progressInterval) {
			clearInterval(progressInterval);
		} else {
			console.log(val);
		}
	});
</script>

<div class="w-screen bg-transparent h-1">
	{#if progress}
		<div
			class="bg-amber-600 h-1 transition-[width] ease-linear duration-[5000ms]"
			style="width: {progress}%"
		/>
		{progress}
	{/if}
</div>
