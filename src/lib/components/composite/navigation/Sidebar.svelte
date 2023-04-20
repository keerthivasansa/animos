<script lang="ts">
	import AppRail from './AppRail.svelte';
	import Tile from './Tile.svelte';
	import Icon from '@iconify/svelte';
</script>

<AppRail>
	<div slot="lead" class="text-white">
		<Tile label="Top airing">
			<Icon icon="fa6-solid:chart-line" color="white" width="24px" />
		</Tile>
		<Tile label="Popular">
			<Icon icon="fa6-solid:users" color="white" width="24px" />
		</Tile>
	</div>
	<div slot="trail">
		<a href="https://twitter.com/keerthivasansa_">
			<Tile class="bg-black">
				<Icon icon="mdi:twitter" color="white" width="24px" />
			</Tile>
		</a>
		<a href="https://github.com/keerthivasansa/animos">
			<Tile class="bg-white">
				<Icon icon="mdi:github" color="black" width="24px" />
			</Tile>
		</a>
	</div>
</AppRail>
