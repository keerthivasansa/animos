<script lang="ts">
  import History from "../lib/components/History.svelte";

  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import EpisodeProgress from "$lib/components/EpisodeProgress.svelte";
  import { formatTime } from "$lib/utils";
  import type { Anime } from "@prisma/client";
  import { onMount } from "svelte";

  async function getPosters(): Promise<Anime[]> {
    let posters = await window.api.anime.posters();
    console.log(posters);
    return posters as any;
  }

  async function getUpdates() {
    let alreadyShowed = sessionStorage.getItem("update-show");
    if (alreadyShowed) {
      return;
    }
    sessionStorage.setItem("update-show", "true");
    let update = await window.api.system.getUpdates();
    if (!update.available) {
      console.log("No update found");
      return;
    }
    let body = `Click to install version: ${update.version}`;
    new Notification("Update found", {
      body,
    }).onclick = () => {
      window.api.system.downloadUpdate();
    };
  }

  async function getContinueWatching() {
    return window.api.episode.getContinueWatching();
  }

  async function getRecommended() {
    return window.api.anime.getUserRecommendations();
  }

  onMount(getUpdates);
</script>

{#await getPosters()}
  Loading
{:then trendingAnime}
  <Carousel animeArr={trendingAnime} />
{/await}

<main class="sm:px-10 my-5 text-white">
  <section class="my-10">
    {#await getContinueWatching()}
      Loading . . .
    {:then episodes}
      {#if episodes.length}
        <h2 class="text-2xl font-semibold text-center sm:text-left">
          Continue Watching
        </h2>
        <div class="flex gap-12 my-8 flex-wrap justify-center sm:justify-start">
          {#each episodes as ep}
            <History episode={ep} />
          {/each}
        </div>
      {/if}
    {/await}
  </section>

  <section class="my-24">
    {#await getRecommended() then animes}
      {#if animes.totalItems}
        <h2 class="text-2xl text-center sm:text-left font-semibold my-5">
          Recommended:
        </h2>
        <div
          class="flex gap-5 flex-wrap justify-center sm:justify-start px-2 sm:px-0"
        >
          {#each animes.data as anime}
            <CoverAnime {anime} />
          {/each}
        </div>
      {/if}
    {/await}
  </section>
</main>
