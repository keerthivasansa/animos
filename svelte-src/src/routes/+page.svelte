<script lang="ts">
  import { clickOutside } from "$lib/actions";
  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import { lockBody } from "$lib/stores";
  import { formatTime } from "$lib/utils";
  import type { Anime } from "@prisma/client";

  async function getPosters(): Promise<Anime[]> {
    let posters = await window.api.anime.posters();
    console.log(posters);
    return posters as any;
  }

  async function getUpdates() {
    let alreadyShowed = localStorage.getItem("update-show");
    if (alreadyShowed) {
      return;
    }
    localStorage.setItem("update-show", "true");
    let update = await window.api.system.getUpdates();
    if (!update.version) {
      console.log("No update found");
      return;
    }
    showUpdate = true;
    lockBody.set(true);
    let notes: any[] = update.releaseNotes
      .split("<")
      .map((val) => val.trim().split(">")[1])
      .filter((val) => val != "" && val != undefined);
    [undefined, "CHANGELOG"].forEach((avoidVal) => {
      if (notes.includes(avoidVal)) {
        notes.splice(notes.indexOf(avoidVal), 1);
      }
    });
    console.log(notes);
    return {
      version: update.version,
      notes,
    };
  }
  let showUpdate = false;

  function closeUpdateDialog() {
    lockBody.set(false);
    showUpdate = false;
  }

  async function getContinueWatching() {
    return window.api.episode.getContinueWatching();
  }

  async function getRecommended() {
    return window.api.anime.getUserRecommendations();
  }
</script>

{#await getUpdates() then updateCheckResult}
  {#if showUpdate && updateCheckResult}
    <div
      class="w-screen h-screen flex z-50 justify-center bg-black bg-opacity-40 items-center overflow-hidden fixed top-0 left-0"
    >
      <div
        use:clickOutside
        on:outclick={closeUpdateDialog}
        class="rounded-lg text-white bg-gray-700 flex gap-4 flex-col font-semibold px-10 py-8"
      >
        <h3 class="text-3xl my-4">Update Found</h3>
        <span class="my-2">Version: {updateCheckResult.version}</span>
        <div>
          <div>Notes:</div>
          <div class="text-sm h-fit w-fit font-normal flex flex-col gap-2">
            <ul>
              {#each updateCheckResult.notes as note}
                <li class="list-decimal">{note}</li>
              {/each}
            </ul>
          </div>
        </div>
        <button
          class="bg-accent"
          on:click={(_) => {
            window.api.system.downloadUpdate();
            closeUpdateDialog();
          }}>Install</button
        >
      </div>
    </div>
  {/if}
{/await}

{#await getPosters()}
  Loading
{:then trendingAnime}
  <Carousel anime={trendingAnime} />
{/await}

<main class="px-10 my-5 text-white">
  <section>
    <h2 class="text-2xl font-semibold">Continue Watching</h2>
    {#await getContinueWatching()}
      Loading . . .
    {:then episodes}
      <div class="flex gap-12 my-8">
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
    {/await}
  </section>

  <section>
    {#await getRecommended() then animes}
      {#if animes.totalItems}
        <h2 class="text-2xl font-semibold my-5">Recommended:</h2>
        <div class="flex gap-5 flex-wrap">
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
