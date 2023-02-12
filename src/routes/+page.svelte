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

<svelte:head>
  <!-- HTML Meta Tags -->
  <title>animos | Free High Quality Streaming</title>
  <meta
    name="description"
    content="animos is a free and open source platform to stream HD streams for anime"
  />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content="https://animos.cf" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="animos | Free High Quality Streaming" />
  <meta
    property="og:description"
    content="animos is a free and open source platform to stream HD streams for anime"
  />
  <meta
    property="og:image"
    content="https://camo.githubusercontent.com/822fd9fbe141157c88c4109d26430a152feac656f0de08b12bf80364ac25390f/68747470733a2f2f696b2e696d6167656b69742e696f2f7538686575396a68712f4865616465725f42616e6e65722e706e67"
  />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="animos.cf" />
  <meta property="twitter:url" content="https://animos.cf" />
  <meta name="twitter:title" content="animos | Free High Quality Streaming" />
  <meta
    name="twitter:description"
    content="animos is a free and open source platform to stream HD streams for anime"
  />
  <meta
    name="twitter:image"
    content="https://camo.githubusercontent.com/822fd9fbe141157c88c4109d26430a152feac656f0de08b12bf80364ac25390f/68747470733a2f2f696b2e696d6167656b69742e696f2f7538686575396a68712f4865616465725f42616e6e65722e706e67"
  />

  <!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

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
