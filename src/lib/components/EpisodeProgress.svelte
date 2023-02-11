<script lang="ts">
  export let length: number;
  export let watched: number;
</script>

<progress
  style="accent-color: var(--accent-color); height: 1rem;"
  class="rounded-lg w-full"
  max={length}
  value={watched}
/>

<style lang="postcss">
  ::-webkit-progress-bar {
    @apply rounded-md h-2 w-full;
  }

  ::-webkit-progress-value {
    -webkit-appearance: none;
    background: var(--accent-color);
    @apply rounded-md;
  }
</style>
