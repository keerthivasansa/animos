<script lang="ts">
	import { getAccentClrType } from '$lib/utils';
	import { onMount } from 'svelte';
	let clrType: 'dark' | 'light';

	onMount(() => {
		clrType = getAccentClrType();
	});
</script>

<div
	class="w-10 p-3 justify-center items-center flex rounded-md accent-bg {clrType == 'dark'
		? 'text-white'
		: 'text-black'}"
>
	<slot />
</div>
