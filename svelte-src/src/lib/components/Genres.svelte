<script lang="ts">
  import { getGenreColor } from "$lib/utils";
  import type { Anime } from "@prisma/client";

  export let anime: Anime;
  export let size = "small";
</script>

{#if anime.genres}
  <div class="flex gap-2 my-2 w-full">
    {#each anime.genres.split(",").slice(0, 3) as genre}
      <small
        class="px-2 py-1 rounded-sm h-fit w-fit text-xs {size == 'small' ? '' : 'lg:text-base'}"
        style="background-color: {getGenreColor(genre)};">{genre}</small
      >
    {/each}
  </div>
{/if}
