<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import AppShell from '$lib/components/composite/navigation/AppShell.svelte';
	import PageProgress from '$lib/components/base/PageProgress.svelte';
</script>

<AppShell>
	<slot />
</AppShell>
