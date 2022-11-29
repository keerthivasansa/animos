<script lang="ts">
  import FaNext from "svelte-icons/fa/FaAngleRight.svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte";
  import { getGenreColor } from "$lib/utils";
  import type { Anime } from "@prisma/client";

  export let anime: Anime[];

  let index = 0;
  let focus = true;

  function nextSlide() {
    index += 1;
    if (index == anime.length) index = 0;
  }

  function getTitle(anime: Anime) {
    return anime.title_en ?? anime.title ?? anime.title_jp;
  }

  function prevSlide() {
    index -= 1;
    if (index < 0) index = anime.length - 1;
  }

  // caches all the images together so they dont load when it comes to focus
  function cacheImages() {
    anime.forEach((an) => {
      const img = document.createElement("img");
      img.src = an.posterImg;
      img.onload = () => {
        document.removeChild(img);
      };
    });
  }
  cacheImages();
</script>

<div class="w-full my-8 py-3 slider relative overflow-hidden rounded-lg">
  <button on:click={prevSlide} class="nav-btn left-0 top-0">
    <div class="w-8">
      <FaPrev />
    </div>
  </button>
  <div
    on:mouseenter={(_) => (focus = true)}
    class="mx-5 rounded-lg relative"
    style="background-image: url('{anime[index]
      .coverImg}'); background-size: cover; width: 96vw; aspect-ratio: 21 / 5; height: 24vw; transition: background-image 500ms ease-in-out"
  >
    <div
      class:opacity-100={focus}
      class="absolute top-0 rounded-l-lg transition-all ease-in-out duration-500 opacity-0 left-0 px-14 py-12 flex flex-col gap-10 h-full center bg-black text-white bg-opacity-95"
    >
      <h2
        title={getTitle(anime[index])}
        class="text-2xl title-box w-full max-w-xs font-semibold text-ellipsis"
      >
        {getTitle(anime[index])}
      </h2>
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
        <span>
          {anime[index].score}
        </span>
        {#if ["R", "R18"].includes(anime[index].ageRating)}
          <span class="ml-5 bg-red-800 text-white px-2 rounded-md text-md py-1"
            >18+</span
          >
        {/if}
      </div>
      <a href="/info/?animeId={anime[index].kitsuId}&title={getTitle(anime[index])}">
        <button class="btn bg-accent">Learn more</button></a
      >
    </div>
  </div>
  <button on:click={nextSlide} class="nav-btn right-0 top-0">
    <div class="w-8">
      <FaNext />
    </div>
  </button>
</div>

<style lang="postcss">
  .title-box {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
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
