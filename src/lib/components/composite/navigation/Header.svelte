<script lang="ts">
	import { sidebarExpand } from '$lib/stores/sidebar';
	import Tile from './Tile.svelte';
</script>

<div class="bg-dark-800 w-full h-20 px-3">
	<Tile onClick={() => sidebarExpand.set(!$sidebarExpand)} expand={false} />
</div>
