<script lang="ts">
	import { sidebarExpand, sidebarShowLabel } from '$lib/stores/sidebar';

	let classes = '';
	export let style = '';
	export let onClick: () => void = () => {};
	export let label = '';
	export { classes as class };
</script>

<div
	class={`${
		$sidebarExpand ? 'w-full px-3' : 'w-12 justify-center'
	} h-12 my-3 rounded-md text-white flex font-semibold items-center gap-6 ${
		label && $sidebarExpand && 'justify-start'
	} ${!label && 'justify-center'} overflow-hidden text-sm
	${classes} `}
	style="background: linear-gradient(153.43deg, #210768 16.67%, rgba(22, 36, 31, 0.71) 145.45%); {style}"
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
