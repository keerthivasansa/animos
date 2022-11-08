<script lang="ts">
	import { Rating } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import CoverAnime from '$lib/components/CoverAnime.svelte';
	import FaNext from "svelte-icons/fa/FaAngleRight.svelte"	
	import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte"	

	let popularAnime: AnimePopular[] = [];

	let sliderLeft = "-18rem";
	let maxSlideLeft = -(4 * 21);

	async function getPopular() {
		return window.api.popularAnime();
	}

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
		if (currentMargin == 0)
			return;
		let newVal = currentMargin + 24
		console.log(newVal);
		newVal = newVal < 0 ? newVal : 0;
		sliderLeft = `${newVal}rem`;
		console.log(sliderLeft);
	}

	onMount(async () => {
		console.log(popularAnime);
	});
</script>

<!-- TODO implement infinite scrolling -->
<section class="w-full mt-10 py-3 slider relative">
	<button on:click={prevSlide} class="nav-btn -left-5">
		<div class="w-8">
			<FaPrev/>
		</div>
	</button>

	<div style="transform: translateX({sliderLeft});" class="flex gap-5 transition-all ease-in-out duration-500 flex-nowrap">
		<CoverAnime src="https://images7.alphacoders.com/418/418724.png" title="Attack on Titan"/>
		<CoverAnime src="https://images3.alphacoders.com/111/thumb-1920-1116286.jpg" title="Jujutsu Kaisen"/>
		<CoverAnime src="https://wallpaperaccess.com/full/17350.jpg" title="One piece"/>
		<CoverAnime src="https://i.pinimg.com/originals/25/0f/b6/250fb6cc8daf145c13901b0f107260ee.jpg" title="My Hero Academia"/>
	</div>
	<button on:click={nextSlide} class="nav-btn -right-5">
		<div class="w-8">
			<FaNext></FaNext>
		</div>
	</button>
</section>

<style>
	.nav-btn {
		@apply absolute transition-all ease-linear duration-150 opacity-0 hover:opacity-100 w-40 h-full bg-opacity-80 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white;
	}
</style>