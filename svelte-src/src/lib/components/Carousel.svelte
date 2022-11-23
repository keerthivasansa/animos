<script lang="ts">
  import FaNext from "svelte-icons/fa/FaAngleRight.svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte";
  import type { AnimeWithGenre } from "$electron-src/api/anime";
  import { getGenreColor } from "$lib/utils";

  export let anime: AnimeWithGenre[];

  let index = 0;
  let focus = false;

  function nextSlide() {
    index += 1;
    if (index == anime.length) index = 0;
  }

  function getTitle(anime: AnimeWithGenre) {
    return anime.title_en ?? anime.title ?? anime.title_jp;
  }

  function prevSlide() {
    index -= 1;
    if (index < 0) index = anime.length - 1;
  }
</script>

<!-- TODO implement infinite scrolling -->
<div class="w-full py-3 slider relative">
  <button on:click={prevSlide} class="nav-btn left-0 top-0">
    <div class="w-8">
      <FaPrev />
    </div>
  </button>
  <div
    on:mouseenter={(_) => (focus = true)}
    on:mouseleave={(_) => (focus = false)}
    class="mx-5 rounded-lg relative"
    style="background-image: url('{anime[index]
      .coverImg}'); background-size: cover; width: 96vw; aspect-ratio: 21 / 5; height: 24vw; transition: background-image 500ms ease-in-out"
  >
    <div
      class:opacity-100={focus}
      class="absolute top-0 transition-all ease-in-out duration-500 opacity-0 left-0 px-20 py-14 flex flex-col gap-10 h-full center bg-black text-white bg-opacity-90"
    >
      <h2 class="text-2xl font-semibold">{getTitle(anime[index])}</h2>
      <div class="flex gap-4">
        {#if anime[index].genres}
          {#each anime[index].genres.split(",")?.slice(0, 3) as genre}
            <span
              class="text-sm px-2 py-1 rounded-sm"
              style="background-color: {getGenreColor(genre)};">{genre}</span
            >
          {/each}
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <div class="w-5 text-amber-400">
          <FaStar />
        </div>
        {anime[index].score}
      </div>
      <button class="btn bg-accent">Learn more</button>
    </div>
  </div>
  <button on:click={nextSlide} class="nav-btn right-0 top-0">
    <div class="w-8">
      <FaNext />
    </div>
  </button>
</div>

<style lang="postcss">
  .opacity-100 {
    opacity: 1;
  }

  .nav-btn {
    @apply absolute transition-all ease-linear duration-150 opacity-0 w-40 h-full bg-opacity-80 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white;
  }
  .nav-btn:hover {
    opacity: 1;
  }
</style>
