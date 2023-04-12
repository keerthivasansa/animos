<script lang="ts">
  export let values: string[] = [];
  export let selected: string[] = [];

  function toggleVal(val: string) {
    if (selected.includes(val)) {
      selected.splice(selected.indexOf(val), 1);
    } else {
      selected.push(val);
    }
    selected = selected;
  }
</script>

<div class="flex gap-2 text-sm">
  {#each values as val}
    <button
      class="rounded-lg {selected.includes(val) ? 'bg-accent' : 'bg-gray-600'}"
      on:click={(_) => toggleVal(val)}>{val}</button
    >
  {/each}
</div>
