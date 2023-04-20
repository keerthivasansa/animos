<script lang="ts">
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<main class="flex flex-col w-screen h-screen">
	<Header />
	<div class="flex flex-1 flex-col">
		<Sidebar />
		<slot />
	</div>
</main>
