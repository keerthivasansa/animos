<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import AppShell from '$lib/components/composite/navigation/AppShell.svelte';

</script>

<svelte:head>
	<script defer data-domain="animos.cf" src="https://analytics.animos.cf/js/script.js"></script>
</svelte:head>

<AppShell>
	<slot />
</AppShell>
