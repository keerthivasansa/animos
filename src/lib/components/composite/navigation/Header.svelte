<script lang="ts">
	import PageProgress from '$lib/components/base/PageProgress.svelte';
	import { sidebarExpand } from '$lib/stores/sidebar';
	import { Hamburger } from 'svelte-hamburgers';
	import Tile from './Tile.svelte';
</script>

<div class="bg-dark-800 w-full flex flex-col">
	<PageProgress />
	<div class="px-3 flex justify-between">
		<div class="w-fit">
			<Tile onClick={() => sidebarExpand.set(!$sidebarExpand)}>
				<Hamburger
					open={$sidebarExpand}
					type={'collapse'}
					--color="white"
					--layer-width="24px"
					--padding="0px"
					--layer-height="3px"
					--hover-opacity="1"
				/>
			</Tile>
		</div>
		<img src="/logo.svg" width="120px" alt="Logo" />
		<div />
	</div>
</div>
