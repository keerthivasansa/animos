<script lang="ts">
	export let anime: {
		image: string;
		title: string;
	};
</script>

<div class="w-48 flex flex-col cursor-pointer rounded-md overflow-hidden">
	<img src={anime.image} alt="Death note" class="w-48" />
	<div class="text-center bg-black py-3">
		<div class="px-4 text-sm font-semibold text-clipper">{anime.title}</div>
	</div>
</div>

<style>
	.text-clipper {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
