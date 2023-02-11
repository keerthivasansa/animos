<script lang="ts">
  import { coverAnimeFocus } from "$lib/stores";
  import { getTitle } from "$lib/utils";
  import type { Anime } from "@prisma/client";
  import { onMount } from "svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import Genres from "./Genres.svelte";

  export let anime: Anime;
  export let infoOnHover = true;
  export let navigate = true;
  export let rank = -1;

  let currentCoverAnime: number;
  let element: HTMLElement;
  const topIndexColors = ["#FFE145", "#E6E6E6", "#FFAD61"];

  coverAnimeFocus.subscribe((val) => (currentCoverAnime = val));
  $: focused = infoOnHover && currentCoverAnime == anime.kitsuId;

  let contentSize = "18.2rem";

  let animeTitle = getTitle(anime);
  onMount(() => {
    contentSize = `${
      document.getElementById(`content-${anime.kitsuId}`)?.clientHeight
    }px`;
  });

  let direction = "left";

  function setCoverOpenDirection() {
    direction =
      element.getBoundingClientRect().x + element.clientWidth * 1.5 >
      innerWidth * 0.9
        ? "right"
        : "left";
  }
  onMount(() => {
    setCoverOpenDirection();
    window.addEventListener("resize", setCoverOpenDirection);
  });
</script>

<div>
  <div
    style="height: {contentSize};"
    bind:this={element}
    class="relative w-48 "
    on:mouseenter={(_) => {
      coverAnimeFocus.set(anime.kitsuId);
    }}
    on:mouseleave={(_) => {
      coverAnimeFocus.set(-1);
    }}
  >
    <div
      style={focused
        ? `${direction}: 100%; opacity: 1; z-index: 5`
        : `z-index: -1; ${direction}: 0`}
      class="pl-6 absolute top-0 {focused
        ? `opacity-1`
        : 'opacity-0'} pr-8  h-full pt-10 pb-5 flex flex-col gap-6 transition-all duration-500 {direction ==
      'left'
        ? 'rounded-r-lg'
        : 'rounded-l-lg'} ease-in-out bg-black text-white"
    >
      <Genres {anime} />
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
    <svelte:element
      this={navigate ? "a" : "div"}
      href="/info/{anime.kitsuId}"
      data-sveltekit-reload
      id="content-{anime.kitsuId}"
      class="opacity-1 absolute top-0 left-0 {focused
        ? 'rounded-l-md'
        : 'rounded-md'}"
      style={focused ? "z-index:10" : " z-index: 2;"}
    >
      <div
        class="w-48 relative"
        style="background-image: url('{anime.posterImg}'); aspect-ratio: 7 / 9;background-size:cover;"
      >
        {#if rank >= 0}
          <div
            style={`z-index: ${
              focused ? "50" : "5"
            }; background: linear-gradient(to bottom, rgb(0, 0, 0, 10%), rgb(0, 0, 0, 100%)); color: ${
              topIndexColors[rank]
            }`}
            class="absolute flex items-end px-4 font-bold py-2 justify-end bottom-0 h-3/5 left-0 w-full"
          >
            <span class="{rank < 3 ? 'text-lg' : 'text-base'} mx-1">#</span>
            <span class={rank < 3 ? "text-5xl" : "text-3xl"}>{rank + 1}</span>
          </div>
        {/if}
      </div>

      <div
        class="bg-black text-white bg-opacity-30 flex items-center justify-center opacity-1 text-center py-3"
      >
        <h2 class="text-sm limit-lines">
          {animeTitle}
        </h2>
      </div>
    </svelte:element>
  </div>
</div>

<style>
  .limit-lines {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    text-align: center;
    padding: 2px 8px;
    height: 2rem;
    line-height: 1rem;
    -webkit-box-orient: vertical;
  }
</style>
