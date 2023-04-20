<script lang="ts">
	import * as icons from 'lucide-svelte';
	export let name: keyof typeof icons;
</script>

<svelte:component this={icons[name]} {...$$props} />
