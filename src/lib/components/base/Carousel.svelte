<script lang="ts">
	export let currentSlide: number = 0;
	export let totalSlides = 5;
	import { Swipe } from 'svelte-swipe';
</script>

<Swipe>
	<div class="container overflow-scroll" style="transform: translateX({currentSlide * 100}%);">
		<div class="item bg-black" />
		<div class="item bg-red" />
	</div>
</Swipe>

<style>
	.container {
		width: 100%;
		overflow: hidden;
	}

	.item {
		width: 100%;
		height: 24rem;
	}
</style>
