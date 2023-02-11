<script lang="ts">
  import { page } from "$app/stores";
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  import FaPlay from "svelte-icons/fa/FaPlay.svelte";
  import { onMount } from "svelte";
  import { State, type EpisodeWithSkip, type TrpcClient } from "$lib/types";
  import EpisodeProgress from "$lib/components/EpisodeProgress.svelte";
  import type { inferAsyncReturnType } from "@trpc/server";
  import { trpc } from "$lib/trpc";

  let kitsuId: number;
  let episodeNum: number;
  let episodePage: number;
  let setSourceFn: (episode: EpisodeWithSkip) => Promise<void>;

  let totalEpisodes = parseInt(
    $page.url.searchParams.get("totalEpisode") ?? "0"
  );

  let currentEp: inferAsyncReturnType<TrpcClient["episode"]["get"]["query"]>;
  let result: {
    allEpisodes: inferAsyncReturnType<
      TrpcClient["episode"]["getEpisodePage"]["query"]
    >;
    history: inferAsyncReturnType<TrpcClient["episode"]["getHistory"]["query"]>;
  };

  let pageState: State = State.Loading;

  export const trpcClient = trpc($page);

  async function changeEpisodePage(epPage: number) {
    if (epPage == episodePage) return;
    let ep = (epPage - 1) * 20 + 1;
    episodeNum = ep;
    episodePage = epPage;
    result.allEpisodes = [];
    result.allEpisodes = await trpcClient.episode.getEpisodePage.query({
      kitsuId,
      page: epPage,
    });
  }

  async function changeCurrentEpisode(epNum: number) {
    // result.currentEp = null;
    const newEp = await trpcClient.episode.get.query({
      episodeNumber: epNum,
      kitsuId,
    });
    setSourceFn(newEp);
    currentEp = newEp;
    console.log("Changed episode source");
  }

  async function fetchEpisodeSrc() {
    let params = $page.url.searchParams;
    let episodeTempId = params.get("episodeId");
    let animeTempId = params.get("animeId");
    if (!animeTempId || !episodeTempId) {
      location.href = "/";
      animeTempId = episodeTempId = "";
    }
    kitsuId = parseInt(animeTempId);
    episodeNum = parseInt(episodeTempId);
    episodePage = Math.floor(episodeNum / 20) + 1;
    let allEpisodes = await trpcClient.episode.getEpisodePage.query({
      kitsuId,
      page: episodePage,
    });
    console.log(
      "Fetched all episodes in page",
      episodePage,
      allEpisodes.length
    );
    console.log(allEpisodes);
    currentEp = await trpcClient.episode.get.query({
      kitsuId,
      episodeNumber: episodeNum,
    });
    let history = await trpcClient.episode.getHistory.query({
      episodeNumber: episodeNum,
      kitsuId,
    });
    result = {
      allEpisodes,
      history,
    };
    console.log("Current episode:");
    console.log(currentEp);
    console.dir({ result });
    pageState = State.Finished;
  }

  onMount(fetchEpisodeSrc);
</script>

<svelte:window
  on:load={(_) => {
    console.log("loaded");
    document
      .getElementById(`ep-${currentEp.number}`)
      ?.scrollIntoView({ behavior: "smooth" });
  }}
/>

<svelte:head>
  <title
    >{pageState == State.Finished
      ? `${currentEp.title} | ${currentEp.anime.title} | animos`
      : "animos"}</title
  >
</svelte:head>

<section
  class="flex px-4 main-wrapper relative justify-evenly items-center overflow-hidden text-white"
  style="height: 100%;"
>
  <div class="rounded-lg my-10 video-container">
    {#if pageState == State.Loading}
      <div
        style="width: 60rem;"
        class="animate-pulse aspect-video flex flex-center bg-slate-700 rounded-lg"
      >
        <div class="w-10 text-slate-400">
          <FaPlay />
        </div>
      </div>
      <div class="mx-5 my-4">
        <div class="animate-pulse bg-slate-700 w-52 h-10 rounded-lg" />
      </div>
    {:else}
      <div class="overflow-y-auto">
        <div>
          {#if currentEp}
            <VideoPlayer
              {currentEp}
              hasNextEp={result.allEpisodes.some(
                (ep) => ep.number > currentEp.number
              )}
              {totalEpisodes}
              bind:setSourceFn
            />
          {/if}
        </div>

        <div class="mx-5 my-4">
          <div class="text-sm text-gray-100 my-4">
            Episode {currentEp.number}
          </div>
          <h3 class="text-xl font-bold">
            {currentEp.title}
          </h3>
          <br />
        </div>
      </div>
    {/if}
  </div>
  <div class="episodes-container pr-10 py-20">
    <div>
      <span class="text-2xl font-semibold">Episodes</span>
      {#if totalEpisodes > 20}
        <select
          on:input={(e) => changeEpisodePage(parseInt(e.currentTarget.value))}
          name="episode-page"
          class="bg-gray-200 h-fit w-fit text-sm ml-5 rounded-md"
          value={episodePage}
        >
          {#each Array.from( { length: Math.ceil(totalEpisodes / 20) } ) as _, index}
            <option value={index + 1}
              >{index * 20 + 1} - {(index + 1) * 20}</option
            >
          {/each}
        </select>
      {/if}
    </div>
    <div class="flex gap-4 my-5 flex-col episode-wrapper overflow-y-auto">
      {#if pageState != State.Loading}
        {#each result.allEpisodes as ep (ep.number)}
          {@const currentHistory = result.history.find(
            (hist) => hist.episodeNumber === ep.number
          )}
          {@const progress =
            currentHistory && ep.length
              ? currentHistory.watchTime / ep.length
              : 0}
          <button
            class="flex-grow w-full"
            on:click={(_) => changeCurrentEpisode(ep.number)}
          >
            <div
              id="ep-{ep.number}"
              style={ep.number == currentEp.number
                ? "border: 3px solid var(--accent-color);"
                : ""}
              class="{progress > 0.9
                ? 'opacity-50'
                : 'opacity-100'} cursor-pointer font-semibold w-full text-left border-slate-500 border-2 rounded-sm my-2"
            >
              <img src={ep.thumbnail} />
              <div class="px-4 py-2 flex gap-2 flex-col text-sm">
                <span class="my-4">{ep.number}. {ep.title}</span>
                {#if ep?.length}
                  <EpisodeProgress length={ep.length ?? 0} watched={progress} />
                {/if}
              </div>
            </div>
          </button>
        {/each}
      {:else}
        {#each Array.from({ length: 10 }) as _}
          <div
            class="bg-slate-700 h-8 w-full rounded-md animate-pulse my-2 px-3 py-2"
          />
        {/each}
      {/if}
    </div>
  </div>
</section>

<style lang="postcss">
  .episodes-container {
    height: 100%;
    overflow-y: auto;
    width: 26rem;
  }

  @media (min-height: 1400px), (max-width: 750px) {
    .video-container {
      width: fit-content;
    }
    .episodes-container {
      width: 100%;
      @apply px-10 my-0 py-0 w-fit;
    }
    .main-wrapper {
      @apply flex-col;
    }
    .episode-wrapper {
      @apply flex-row flex-wrap;
    }
  }
</style>
