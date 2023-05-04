<script lang="ts">
	import { sidebarExpand, sidebarShowLabel } from '$lib/stores/sidebar';
</script>

<div
	class="{$sidebarExpand ? 'z-50' : '-z-10 sm:z-0'} flex absolute top-20 left-0"
	style="height: calc(100dvh - 5rem);"
>
	<div
		class="rail flex flex-col transition-[width, transform] h-full {$sidebarExpand &&
			'active'} duration-300 justify-between bg-[#101010] py-2 px-3"
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
