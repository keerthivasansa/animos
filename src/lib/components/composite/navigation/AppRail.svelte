<script lang="ts">
	import { sidebarExpand, sidebarShowLabel } from '$lib/stores/sidebar';
</script>

<div class="flex z-50">
	<div
		class="rail flex flex-col transition-[width, transform] {$sidebarExpand &&
			'active'} duration-300 justify-between bg-dark-800 py-2 px-3"
		class:active={$sidebarExpand}
		on:transitionend={() => {
			if ($sidebarExpand) $sidebarShowLabel = true;
		}}
	>
		<slot name="lead" />
		<slot name="trail" />
	</div>
</div>

<style lang="postcss">
	.rail {
		@apply w-60 sm:w-18 -translate-x-full sm:translate-x-0;
	}

	.active {
		width: 15rem;
		@apply translate-x-0;
	}
</style>
