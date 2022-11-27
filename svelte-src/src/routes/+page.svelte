<script lang="ts">
  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import { formatTime } from "$lib/utils";
  import type { Anime } from "@prisma/client";

  async function get(id: number) {
    let anime = await window.api.anime.info(id);
    console.log(anime);
    return anime;
  }

  async function getPosters(): Promise<Anime[]> {
    let posters = await window.api.anime.posters();
    console.log(posters);
    return posters as any;
  }

  async function getContinueWatching() {
    return window.api.episode.getContinueWatching();
  }
</script>

{#await getPosters()}
  Loading
{:then trendingAnime}
  <Carousel anime={trendingAnime} />
{/await}

<section class="px-10 my-5 text-white">
  <h2 class="text-2xl font-semibold">Continue Watching</h2>
  {#await getContinueWatching()}
    Loading . . .
  {:then episodes}
    <div class="flex gap-5 my-8">
      {#each episodes as ep}
        <a href="/episode?animeId={ep.anime.kitsuId}&episodeId={ep.number}">
          <div class="flex flex-col gap-2 items-center">
            <CoverAnime anime={ep.anime} infoOnHover={false} navigate={false} />
            <div
              class="flex justify-between w-full text-sm my-2 text-gray-300 px-2"
            >
              <span>Episode {ep.number}</span>
              <span
                >{formatTime(ep.watchTime)} / {formatTime(ep.length ?? 0)}</span
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
  {/await}
</section>

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
