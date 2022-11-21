<script lang="ts">
  import type { AnimeWithGenre } from "$electron-src/api/anime";
  import { coverAnimeFocus } from "$lib/stores";
  import FaStar from "svelte-icons/fa/FaStar.svelte";

  export let anime: AnimeWithGenre;

  const genreColors = ["#742802", "#c14a09", "#b0306a", "#985538", "#35654d"];

  let currentCoverAnime: number;

  coverAnimeFocus.subscribe((val) => (currentCoverAnime = val));
  $: focused = currentCoverAnime == anime.kitsuId;

  function getGenreIndex(name: string) {
    return (name.length + name.charCodeAt(1)) % genreColors.length;
  }
</script>

<div
  class="rounded-lg w-60 h-72 relative"
  on:mouseenter={(_) => {
    coverAnimeFocus.set(anime.kitsuId);
  }}
  on:mouseleave={(_) => {
    coverAnimeFocus.set(-1);
  }}
>
  <div
    class="w-full h-full rounded-lg absolute top-0 left-0"
    style="background-image: url('{anime.posterImg}'); background-size: cover; {focused
      ? 'z-index: 3'
      : 'z-index: 1'};"
  />
  <div
    class="absolute px-5 py-10 {focused
      ? 'opacity-95'
      : 'opacity-0'} flex flex-col gap-6 transition-all duration-500 ease-in-out bg-black h-full text-white rounded-r-lg"
    style="left: {focused ? '15rem' : '0'}; top:0; {focused
      ? 'z-index: 2'
      : ''}"
  >
    <h2 class="text-xl font-semibold">{anime.title_en}</h2>
    <div class="flex gap-2 my-2 w-full">
      {#each anime.genre.slice(0, 3) as genre}
        <small
          class="px-2 py-1 rounded-sm text-xs"
          style="background-color: {genreColors[getGenreIndex(genre)]};"
          >{genre}</small
        >
      {/each}
    </div>
    <div class="flex gap-2 items-center">
      <div class="w-4 text-amber-400">
        <FaStar />
      </div>
      <span>{anime.score}</span>
    </div>
    <button class="text-md my-5 bg-accent">Learn more</button>
  </div>
</div>
