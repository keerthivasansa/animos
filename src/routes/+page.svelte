<script lang="ts">
  import History from "../lib/components/History.svelte";
  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import type { Anime } from "@prisma/client";
  import { trpc } from "$lib/trpc";
  import { page } from "$app/stores";

  async function getPosters(): Promise<Anime[]> {
    let posters = await trpc($page).anime.trendingPosters.query();
    console.log(posters);
    return posters as any;
  }

  async function getContinueWatching() {
    return [];
  }

  async function getRecommended() {
    return trpc($page).anime.userRecommendations.query();
  }
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
