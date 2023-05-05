<script lang="ts">
	import Icon from '@iconify/svelte';
	import Tile from './Tile.svelte';

	let mobileSearchOpen = false;
</script>

<div
	class="bg-[#101010] h-14 items-center sm:px-4 z-10 w-full sm:relative flex gap-2"
	class:expanded={mobileSearchOpen}
>
	<button
		class="w-fit hidden"
		class:display-flex={mobileSearchOpen}
		on:click={() => (mobileSearchOpen = false)}
	>
		<Tile>
			<Icon icon="ic:baseline-close" width="24px" color="white" />
		</Tile>
	</button>
	<form
		action="/search"
		method="GET"
		class="hidden sm:flex gap-2 flex-1 items-center h-fit justify-end"
		class:display-flex={mobileSearchOpen}
	>
		<input
			type="text"
			name="q"
			class="h-fit flex-1 sm:flex-none sm:w-60 py-2 px-3 text-black outline-none font-semibold rounded-md"
		/>
		<button type="submit" class="w-fit">
			<Tile>
				<Icon icon="material-symbols:search-rounded" color="white" width="24px" />
			</Tile>
		</button>
		<!-- <button type="submit" class="flex items-center justify-center h-12 w-12 bg-accent rounded-md">
		</button> -->
	</form>
	<div class="flex flex-1 sm:hidden justify-end" class:hide={mobileSearchOpen}>
		<button type="button" class="w-fit" on:click={(_) => (mobileSearchOpen = true)}>
			<Tile>
				<Icon icon="material-symbols:search-rounded" color="white" width="24px" />
			</Tile>
		</button>
	</div>
</div>

<style lang="postcss">
	.expanded {
		@apply absolute top-0 left-0 px-4;
	}

	.display-flex {
		@apply flex;
	}

	.hide {
		@apply hidden;
	}
</style>
