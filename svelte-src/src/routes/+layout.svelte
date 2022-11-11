<script lang="ts">
	import '../app.postcss';

	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let keyw = '. . .';

	onMount(() => {
		keyw = $page.url.searchParams.get('keyw') ?? '';
	});
</script>

<main class="dark:bg-slate-900 overflow-hidden dark:text-white">
	<nav
		style="z-index: 50;"
		class="flex backdrop-blur-md dark:bg-slate-800 bg-opacity-50 p-4 py-6 pr-10 sticky items-center justify-between border-b-2 border-slate-200 dark:border-slate-800"
	>
		<a href="/">
			<h1 class="mx-2 text-center text-3xl font-black">animos</h1>
		</a>
		<form action="search" method="get" class="flex justify-end">
			<div class="mx-8 w-40 focus-within:w-96 ease-linear duration-250 transition-all ">
				<input
					bind:value={keyw}
					placeholder="Search"
					name="keyw"
					class="outline-none text-black bg-slate-200 w-full rounded-lg py-2 px-4 font-semibold overflow-ellipsis"
				/>
			</div>
			<button type="submit">
				<div class="p-3 rounded-md btn-accent text-white dark:text-black">
					<div class="icon">
						<FaSearch />
					</div>
				</div>
			</button>
		</form>
	</nav>
	<div class="relative">
		<div class="absolute overflow-y-auto overflow-x-hidden top-0 left-0 right-0 max-h-screen pb-32">
			<slot />
		</div>
	</div>
</main>

<style>
	:global(body), main {
		overflow: hidden;
		width: 100vw;
		height: 100vh;
	}
</style>
