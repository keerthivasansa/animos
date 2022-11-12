<script lang="ts">
	import CoverAnime from '$lib/components/CoverAnime.svelte';
	import FaNext from "svelte-icons/fa/FaAngleRight.svelte"	
	import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte"	
	import type { TrendingPoster } from '$electron/types';

	export let anime:TrendingPoster[];

	let maxSlideLeft = -(anime.length * 21);
	let maxSlideRight = 2;
	let sliderLeft = `${maxSlideRight}rem`;

	function nextSlide() {
		let currentMargin = parseInt(sliderLeft);
		if (currentMargin == maxSlideLeft)
			return;
		let newVal = currentMargin - 24
		newVal = newVal > maxSlideLeft ? newVal : maxSlideLeft;
		sliderLeft = `${newVal}rem`;
		console.log(sliderLeft);
	}

	function prevSlide() {
		let currentMargin = parseInt(sliderLeft);
		if (currentMargin == maxSlideRight)
			return;
		let newVal = currentMargin + 24
		console.log(newVal);
		newVal = newVal < maxSlideRight ? newVal : maxSlideRight;
		sliderLeft = `${newVal}rem`;
		console.log(sliderLeft);
	}

</script>

<!-- TODO implement infinite scrolling -->
<div class="w-full mt-10 py-3 slider relative">
	<button on:click={prevSlide} class="nav-btn left-0 top-0">
		<div class="w-8">
			<FaPrev/>
		</div>
	</button>

	<div style="transform: translateX({sliderLeft});" class="flex gap-5 transition-all ease-in-out duration-500 flex-nowrap">
		{#each anime as an}
			<CoverAnime src={an.img} title={an.title} id={an.malId}/>			
		{/each}
	</div>
	<button on:click={nextSlide} class="nav-btn right-0 top-0">
		<div class="w-8">
			<FaNext></FaNext>
		</div>
	</button>
</div>

<style lang="postcss">
	.nav-btn {
		@apply absolute transition-all ease-linear duration-150 opacity-0 w-40 h-full bg-opacity-80 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white;
	}
	.nav-btn:hover {
		opacity: 1;
	}
</style>