<script lang="ts">
  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
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
    if (!update.version) {
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
  <Carousel anime={trendingAnime} />
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
            <a href="/episode?animeId={ep.anime.kitsuId}&episodeId={ep.number}">
              <div class="flex flex-col gap-2 items-center">
                <CoverAnime
                  anime={ep.anime}
                  infoOnHover={false}
                  navigate={false}
                />
                <div
                  class="flex justify-between w-full text-sm my-2 text-gray-300 px-2"
                >
                  <span>Episode {ep.number}</span>
                  <span
                    >{formatTime(ep.watchTime)} / {formatTime(
                      ep.length ?? 0
                    )}</span
                  >
                </div>
                <progress
                  style="accent-color: var(--accent-color); height: 1rem;"
                  class="rounded-lg"
                  max={ep.length}
                  value={ep.watchTime}
                />
              </div>
            </a>
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

<style lang="postcss">
  ::-webkit-progress-bar {
    @apply rounded-md h-2 w-full;
  }

  ::-webkit-progress-value {
    -webkit-appearance: none;
    background: var(--accent-color);
    @apply rounded-md;
  }
</style>
