<script lang="ts">
	import { navigating } from '$app/stores';
	import { sidebarExpand } from '$lib/stores/sidebar';
	import AppRail from './AppRail.svelte';
	import Tile from './Tile.svelte';
	import Icon from '@iconify/svelte';
	import { ICON_COLOR } from './constants';

	navigating.subscribe((val) => {
		if (val)
			// if navigating, close sidebar
			sidebarExpand.set(false);
	});
</script>

<AppRail>
	<div slot="lead" class="text-white">
		<a href="/">
			<Tile label="Home">
				<Icon icon="ri:home-2-fill" color={ICON_COLOR} width="24px" />
			</Tile>
		</a>
		<a href="/trending">
			<Tile label="Top airing">
				<Icon icon="fa6-solid:chart-line" color={ICON_COLOR} width="24px" />
			</Tile>
		</a>
		<a href="/popular">
			<Tile label="Popular">
				<Icon icon="fa6-solid:users" color={ICON_COLOR} width="24px" />
			</Tile>
		</a>
	</div>
	<div slot="trail">
		<a href="https://twitter.com/keerthivasansa_">
			<Tile class="bg-black">
				<Icon icon="mdi:twitter" color={ICON_COLOR} width="24px" />
			</Tile>
		</a>
		<a href="https://github.com/keerthivasansa/animos">
			<Tile class="bg-[#FFFFFF]">
				<Icon icon="mdi:github" color="black" width="24px" />
			</Tile>
		</a>
	</div>
</AppRail>

<style>
	a {
		text-decoration: none !important;
		color: white !important;
	}
</style>
