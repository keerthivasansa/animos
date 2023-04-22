<script lang="ts">
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<main class="flex flex-col w-screen h-full overflow-hidden">
	<Header />
	<div class="flex flex-1 flex-row justify-start">
		<Sidebar />
		<slot />
	</div>
</main>
