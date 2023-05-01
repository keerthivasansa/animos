<script lang="ts">
	import PageProgress from '$lib/components/base/PageProgress.svelte';
	import { sidebarExpand } from '$lib/stores/sidebar';
	import { Hamburger } from 'svelte-hamburgers';
	import Tile from './Tile.svelte';
	import Icon from '@iconify/svelte';
</script>

<div class="bg-dark-800 w-full flex flex-col">
	<PageProgress />
	<div class="px-4">
		<div class="w-fit">
			<Tile onClick={() => sidebarExpand.set(!$sidebarExpand)}>
				<div class="h-full flex items-center">
					<Hamburger
						open={$sidebarExpand}
						type={'collapse'}
						--color="white"
						--layer-width="28px"
						--padding="0px"
						--layer-height="3px"
						--hover-opacity="1"
					/>
				</div>
			</Tile>
		</div>
	</div>
</div>
