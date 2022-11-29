<script lang="ts">
  import { page } from "$app/stores";
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  import FaPlay from "svelte-icons/fa/FaPlay.svelte";
  import { onMount } from "svelte";
  import { State, type EpisodeWithSkip } from "$lib/types";

  let animeId: number;
  let episodeNum: number;
  interface Episode {
    title: string;
    id: number;
    number: number;
  }

  let result: {
    currentEp: EpisodeWithSkip;
    allEpisodes: Episode[];
  };

  let pageState: State = State.Loading;

  async function fetchEpisodeSrc() {
    let params = $page.url.searchParams;
    let episodeTempId = params.get("episodeId");
    let animeTempId = params.get("animeId");
    if (!animeTempId || !episodeTempId) {
      location.href = "/";
      animeTempId = episodeTempId = "";
    }
    animeId = parseInt(animeTempId);
    episodeNum = parseInt(episodeTempId);

    console.log({ episodeId: episodeNum, animeId });
    console.time("new anime");
    let allEpisodes = (await window.api.episode.info(animeId)) as Episode[];
    let currentEp = await window.api.episode.get(animeId, episodeNum);
    result = {
      currentEp,
      allEpisodes,
    };
    console.dir({ result });
    pageState = State.Finished;
  }

  onMount(fetchEpisodeSrc);
</script>

<section class="flex justify-between px-4 text-white">
  <div class="rounded-lg overflow-hidden my-10 fixed w-240">
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
          <VideoPlayer
          episode={result.currentEp}
          hasNextEp={result.allEpisodes.some(
            (ep) => ep.number > result.currentEp.number
          )}
        />
        </div>
        
        <div class="mx-5 my-4">
          <div class="text-sm text-gray-100 my-4">
            Episode {result.currentEp.number}
          </div>
          <h3 class="text-xl font-bold">
            {result.currentEp.title}
          </h3>
          <br />
        </div>
      </div>
    {/if}
  </div>
  <div class="episodes-container" style="margin-left: 65rem;">
    <div class="my-14" style="width: 23rem;">
      <h3 class="text-2xl font-semibold">Episodes</h3>
      <div class="flex gap-4 my-5 flex-col episode-wrapper">
        {#if pageState != State.Loading}
          {#each result.allEpisodes as ep (ep.number)}
            <a
              data-sveltekit-reload
              href="/episode?episodeId={ep.number}&animeId={animeId}"
            >
              <button
                style={ep.number == episodeNum
                  ? "border: 3px solid var(--accent-color);"
                  : ""}
                class="cursor-pointer w-full text-left border-slate-400 border-2 rounded-md my-2 px-4 py-3"
              >
                <span class="my-4">{ep.number}. {ep.title}</span>
              </button>
            </a>
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
  </div>
</section>

<style>
  .episodes-container {
    height: 100%;
    overflow-y: auto;
  }

  .w-240 {
    max-width: 60rem;
  }
</style>
