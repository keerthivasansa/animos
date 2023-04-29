<script lang="ts">
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<main class="flex flex-col w-screen h-screen">
	<Header />
	<Sidebar />
	<div class="flex-1 overflow-y-scroll sm:pl-18">
		<slot />
	</div>
</main>
