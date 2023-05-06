<script lang="ts">
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
</script>

<main class="flex flex-col w-screen box-border" style="height: 100dvh">
	<Header />
	<Sidebar />
	<div class="flex-1 overflow-y-auto sm:pl-16 bg-[#212121]">
		<slot />
	</div>
</main>
					