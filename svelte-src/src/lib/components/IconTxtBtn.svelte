<script lang="ts">
	import { accentClr } from '$lib/stores';
	import { lightOrDark } from '$lib/utils';

	export let bgAccent = true;
    export let text = "";

	let fontColor = '';

	accentClr.subscribe((val) => {
		let clrType = lightOrDark(val);
		fontColor = clrType == 'dark' ? 'text-white' : 'text-black';
	});
</script>

<div
	class:bg-accent={bgAccent}
	class="justify-center gap-2 cursor-pointer items-center text-sm w-fit pl-4 font-semibold flex rounded-md {fontColor}"
>
    <span>{text}</span>
    <div class="w-9 h-9 p-3">
        <slot/>
    </div>
</div>
