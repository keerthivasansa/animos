<script lang="ts">
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import FaNext from "svelte-icons/fa/FaAngleRight.svelte";
  import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte";
  import type { AnimeWithGenre } from "$electron-src/api/anime";

  export let anime: AnimeWithGenre[];

  let maxSlideRight = 2;

  let index = 0;

  function nextSlide() {
    index += 1;
    if (index == anime.length)
      index = 0;
  }

  function prevSlide() {
    index -= 1;
    if (index < 0)
      index = anime.length - 1;
  }
</script>

<!-- TODO implement infinite scrolling -->
<div class="w-full py-3 slider relative">
  <button on:click={prevSlide} class="nav-btn left-0 top-0">
    <div class="w-8">
      <FaPrev />
    </div>
  </button>
  <div class="flex gap-5 transition-all ease-in-out duration-500 flex-nowrap">
    <!-- {#each anime as an}
      <div class="h-72 container relative rounded-md" style="aspect-ratio: 21 / 5;">
        <div
          class="absolute top-0 left-0 w-full h-full"
          style="background-image: url('{an.coverImg}'); z-index: -1; background-size: cover; background-position: center;"
        />
        <div
          class="flex absolute bg-black bg-opacity-80 text-white flex-col opacity-0 h-full w-full p-3 transition-all ease-linear duration-150 top-0 left-0 inner"
        >
          <span>{an.title}</span>
          <span>{an.score}</span>
          <span>{an.genres}</span>
        </div>
      </div>
    {/each} -->
    <div
      class="mx-5 rounded-lg"
      style="background-image: url('{anime[index]
        .coverImg}'); background-size: cover; width: 96vw; aspect-ratio: 21 / 5; height: 24vw; transition: background-image 500ms ease-in-out"
    />
  </div>
  <button on:click={nextSlide} class="nav-btn right-0 top-0">
    <div class="w-8">
      <FaNext />
    </div>
  </button>
</div>

<style lang="postcss">
  .container:hover > .inner {
    opacity: 1;
  }
  .nav-btn {
    @apply absolute transition-all ease-linear duration-150 opacity-0 w-40 h-full bg-opacity-80 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white;
  }
  .nav-btn:hover {
    opacity: 1;
  }
</style>
