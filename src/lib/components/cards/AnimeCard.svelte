<script lang="ts">
	import TextClamp from "../composite/TextClamp.svelte";

	export let anime: {
		image: string;
		title: string;
	};
</script>

<div class="w-40 flex flex-col cursor-pointer rounded-md overflow-hidden">
	<img src={anime.image} alt={anime.title} class="w-40 h-56" />
	<div class="text-center bg-black py-3">
		<TextClamp lines={1}>
			<div class="px-4 text-xs font-semibold">{anime.title}</div>
		</TextClamp>
	</div>
</div>