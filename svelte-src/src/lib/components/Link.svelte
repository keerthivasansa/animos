<script lang="ts">
  export let link: string | null;
</script>

{#if link}
  <a href={link}> <slot /></a>
{:else}
  <slot />
{/if}
