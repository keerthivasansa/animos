<script lang="ts">
	let classes: string;

	export { classes as class };
</script>

<div class="rounded-sm px-2 py-1 w-fit {classes}">
	<slot />
</div>
