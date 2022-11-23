<script lang="ts">
  import type { AnimeWithGenre } from "$electron-src/api/anime";
  import { coverAnimeFocus } from "$lib/stores";
  import { getGenreColor } from "$lib/utils";
  import FaStar from "svelte-icons/fa/FaStar.svelte";

  export let anime: AnimeWithGenre;

  let currentCoverAnime: number;

  coverAnimeFocus.subscribe((val) => (currentCoverAnime = val));
  $: focused = currentCoverAnime == anime.kitsuId;
</script>

<div
  class="rounded-lg"
  on:mouseenter={(_) => {
    coverAnimeFocus.set(anime.kitsuId);
  }}
  on:mouseleave={(_) => {
    coverAnimeFocus.set(-1);
  }}
>
  <div class="flex">
    <div
      class="rounded-l-lg w-60 aspect-video overflow-hidden"
      style="background-image: url('{anime.posterImg}');background-size:contain"
    />
    <div
      class="pl-6 pr-8 h-full pt-10 pb-5 flex flex-col gap-6 transition-all duration-500 ease-in-out bg-black bg-opacity-30 text-white rounded-r-lg"
    >
      <h2 class="text-xl font-semibold">{anime.title_en}</h2>
      <div class="flex gap-2 my-2 w-full">
        {#each anime.genres.split(",").slice(0, 3) as genre}
          <small
            class="px-2 py-1 rounded-sm text-xs"
            style="background-color: {getGenreColor(genre)};">{genre}</small
          >
        {/each}
      </div>
      <div class="flex gap-2 items-center">
        <div class="w-4 text-amber-400">
          <FaStar />
        </div>
        <span>{anime.score}</span>
      </div>
      <button class="text-xs my-5 bg-accent">Learn more</button>
    </div>
  </div>
</div>
