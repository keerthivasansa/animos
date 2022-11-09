<script lang="ts">
	import CoverAnime from '$lib/components/CoverAnime.svelte';
	import FaNext from "svelte-icons/fa/FaAngleRight.svelte"	
	import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte"	

	interface CoverAnime {
		title:string, 
		img:string,
	}

	export let anime:CoverAnime[];

	let sliderLeft = "-18rem";
	let maxSlideLeft = -(anime.length * 21);

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

</script>

<!-- TODO implement infinite scrolling -->
<section class="w-full mt-10 py-3 slider relative">
	<button on:click={prevSlide} class="nav-btn -left-5">
		<div class="w-8">
			<FaPrev/>
		</div>
	</button>

	<div style="transform: translateX({sliderLeft});" class="flex gap-5 transition-all ease-in-out duration-500 flex-nowrap">
		{#each anime as an}
			<CoverAnime src={an.img} title={an.title}/>			
		{/each}
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