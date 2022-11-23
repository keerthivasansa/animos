<script lang="ts">
  import type { AnimeWithGenre } from "$electron-src/api/anime";
  import { coverAnimeFocus } from "$lib/stores";
  import { getGenreColor, getTitle } from "$lib/utils";
  import FaStar from "svelte-icons/fa/FaStar.svelte";

  export let anime: AnimeWithGenre;

  let currentCoverAnime: number;

  coverAnimeFocus.subscribe((val) => (currentCoverAnime = val));
  $: focused = currentCoverAnime == anime.kitsuId;
  $: {
    console.log({ focused, anime: anime.kitsuId });
  }
</script>

<div
  style="height: 18.2rem;"
  class="relative w-48 "
  on:mouseenter={(_) => {
    coverAnimeFocus.set(anime.kitsuId);
  }}
  on:mouseleave={(_) => {
    coverAnimeFocus.set(-1);
  }}
>
  <div
    style={focused ? "left: 100%; opacity: 1; z-index: 5" : "z-index: -1;"}
    class="pl-6 absolute top-0 {focused
      ? 'opacity-1'
      : 'left-0 opacity-0'} pr-8  h-full pt-10 pb-5 flex flex-col gap-6 transition-all duration-500 ease-in-out bg-black text-white rounded-r-lg"
  >
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
      {#if ["R", "R18"].includes(anime.ageRating)}
        <span class="ml-5 bg-red-800 text-white px-2 rounded-md text-sm py-1"
          >18+</span
        >
      {/if}
    </div>
    <span class="text-sm">Episodes: {anime.episodes}</span>
  </div>
  <div
    class="opacity-1 absolute top-0 left-0"
    style={focused ? "z-index:10" : " z-index: 2;"}
  >
    <div
      class="{focused ? 'rounded-tl-lg' : 'rounded-t-lg'} w-48"
      style="background-image: url('{anime.posterImg}'); aspect-ratio: 7 / 9;background-size:cover;"
    />

    <div
      class="{focused
        ? 'rounded-bl-lg'
        : 'rounded-b-lg'} bg-black text-white bg-opacity-30 opacity-1 text-center py-3"
    >
      <h2 class="text-sm">
        {getTitle(anime)}
      </h2>
    </div>
  </div>
</div>
