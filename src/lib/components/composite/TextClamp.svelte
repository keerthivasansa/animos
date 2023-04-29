<script lang="ts">
    export let lines = 3;
</script>

<div class="line-clamp" style="-webkit-line-clamp: {lines};">
	<slot />
</div>

<style>
	.line-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
