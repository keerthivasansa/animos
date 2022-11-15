<script lang="ts">
	import { clickOutside } from '$lib/actions';
	import { accentClr, showSettings } from '$lib/stores';
	import FaClose from './FaClose.svelte';
	import IconBtn from './IconBtn.svelte';

	let accentColor = $accentClr;

</script>

<div
	class:hidden={!$showSettings}
	class="w-screen h-screen flex absolute top-0 left-0 z-10 justify-center items-center"
>
	<div
		class="bg-opacity-90 rounded-md text-white"
		style="min-width: 45rem;"
		use:clickOutside
		on:outclick={() => showSettings.set(false)}
	>
		<div id="header" class="flex bg-black justify-between rounded-t-md items-center">
			<span />
			<span>Settings</span>
			<div class="bg-red-600 text-white rounded-tr-md">
				<IconBtn bgAccent={false}>
					<div class="w-3">
						<FaClose />
					</div>
				</IconBtn>
			</div>
		</div>
		<div id="content" class="py-10 px-5 bg-dark-1 rounded-b-md bg-opacity-75">
			<div class="flex gap-2 items-center">
				<span>Accent Color: </span>
				<input
					type="color"
					class="w-5 h-5 rounded-sm"
					bind:value={accentColor}
					on:input={(_) => accentClr.set(accentColor)}
				/>
			</div>
		</div>
	</div>
</div>
