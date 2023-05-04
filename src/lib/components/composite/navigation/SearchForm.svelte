<script lang="ts">
	import Icon from '@iconify/svelte';

	let mobileSearchOpen = false;
</script>

<div
	class="bg-dark-800 h-20 items-center sm:px-4 z-10 w-full sm:relative flex gap-2"
	class:expanded={mobileSearchOpen}
>
	<button
		class="hidden w-12 h-12 flex-shrink-0 bg-accent justify-center rounded-md items-center"
		class:display-flex={mobileSearchOpen}
		on:click={() => (mobileSearchOpen = false)}
	>
		<Icon icon="ic:baseline-close" width="24px" color="black" />
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
			class="h-fit flex-1 sm:flex-none sm:w-60 p-3 text-black outline-none font-semibold rounded-md"
		/>
		<button type="submit" class="flex items-center justify-center h-12 w-12 bg-accent rounded-md">
			<Icon icon="material-symbols:search-rounded" color="black" width="24px" />
		</button>
	</form>
	<div class="flex flex-1 sm:hidden justify-end" class:hide={mobileSearchOpen}>
		<button
			type="button"
			class="flex items-center justify-center h-12 w-12 bg-accent rounded-md"
			on:click={(_) => (mobileSearchOpen = true)}
		>
			<Icon icon="material-symbols:search-rounded" color="black" width="24px" />
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
