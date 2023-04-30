<script lang="ts">
	export let title: string;
	export let image: string;
</script>

<div
	class="w-full h-40 object-cover bg-center sm:h-80 relative"
	style="background-image: linear-gradient(0deg, rgba(0, 0, 0, 100%) 0%, rgba(0, 0, 0, 60%) 80%,  rgba(0, 0, 0, 0%) 100%), url('{image}');"
>
	<h1 class="absolute bottom-12 left-10 text-3xl font-extrabold text-white">{title}</h1>
</div>
