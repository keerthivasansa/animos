<script>
	export let value = 0;
	export let max = 100;
</script>

<div class="w-full rounded-lg bg-slate-600 h-2 relative">
	<div class="h-full rounded-lg bar" style="width:{parseInt(((value / max) * 100).toString())}%" />
</div>

<style>
	.bar {
		background-color: var(--accent-color);
	}
</style>
