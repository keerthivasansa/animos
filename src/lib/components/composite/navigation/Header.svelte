<script lang="ts">
	import PageProgress from '$lib/components/base/PageProgress.svelte';
	import { sidebarExpand } from '$lib/stores/sidebar';
	import Tile from './Tile.svelte';
</script>

<div class="bg-dark-800 w-full flex flex-col">
	<PageProgress />
	<div class="px-3">
		<Tile onClick={() => sidebarExpand.set(!$sidebarExpand)} expand={false} />
	</div>
</div>
