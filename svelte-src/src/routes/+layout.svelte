<script lang="ts">
	import '../app.postcss';
	import IconBtn from '$lib/components/IconBtn.svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import FaGear from '$lib/components/FaGear.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let search: string = '';
	let marginLeft = -4.25;

	function autoCapWords() {
		search = search
			.split(' ')
			.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	}
</script>

<nav class="flex text-white justify-between items-center px-10 py-6" on:mouseleave={(_) => (marginLeft = -4.25)}>
	<div class="flex gap-5">
		<div
			class="transition-all ease-linear duration-200"
			style="margin-left: {marginLeft}rem;"
			on:mouseenter={(_) => (marginLeft = -2)}
		>
			<IconBtn>
				<FaGear />
			</IconBtn>
		</div>
		<Logo />
	</div>
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={search}
			on:input={autoCapWords}
			class="rounded-md {search == ''
				? 'w-32'
				: 'w-60'} font-semibold px-4 py-2 focus:w-60 transition-all ease-in-out duration-200"
		/>
		<IconBtn>
			<FaSearch />
		</IconBtn>
	</div>
</nav>
<slot />
