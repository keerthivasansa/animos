<script>
    import { onMount } from 'svelte';
    let showPlayer = false;
    let player;
    export let src = "";
    onMount(async () => {
      const { defineCustomElements } = await import('@vime/core');
      defineCustomElements();
      showPlayer = true;
    });
    </script>
    {#if showPlayer}
      <vm-player bind:this={player}>
        <vm-video>
             <source data-src={src} type="video/mp4" />
        </vm-video>
        <vm-ui>
             <vm-default-controls />
        </vm-ui>
      </vm-player>
    {/if}