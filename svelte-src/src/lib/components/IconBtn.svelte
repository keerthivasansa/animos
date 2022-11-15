<script lang="ts">
	import { accentClr } from '$lib/stores';
	import { lightOrDark } from '$lib/utils';

	export let bgAccent = true;

	let fontColor = '';

	accentClr.subscribe((val) => {
		let clrType = lightOrDark(val);
		fontColor = clrType == 'dark' ? 'text-white' : 'text-black';
		console.log({ fontColor, clrType, val });
	});
</script>

<div
	class:bg-accent={bgAccent}
	class="w-10 h-10 p-3 justify-center items-center flex rounded-md {fontColor}"
>
	<slot />
</div>
