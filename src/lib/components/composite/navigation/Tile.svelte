<script lang="ts">
	import { sidebarExpand, sidebarShowLabel } from '$lib/stores/sidebar';

	let classes = '';
	export let style = '';
	export let onClick: () => void = () => {};
	export let label = '';
	export let expand = true;
	export { classes as class };
</script>

<div
	class={`${
		expand ? 'w-full' : 'w-14'
	} h-14 my-4 rounded-md bg-slate-800 flex items-center gap-6 px-4 ${
		label && $sidebarExpand && 'justify-start'
	} ${!label && 'justify-center'} overflow-hidden
	${classes} `}
	{style}
	on:click={onClick}
	on:keydown={onClick}
>
	<slot />
	{#if $sidebarShowLabel && label}
		<div class="transition-all duration-75 ease-linear">
			{label}
		</div>
	{/if}
</div>
