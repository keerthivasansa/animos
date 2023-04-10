<script lang="ts">
  import Genres from "$lib/components/Genres.svelte";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaDown from "svelte-icons/fa/FaArrowDown.svelte";
  import FaHeart from "svelte-icons/fa/FaHeart.svelte";
  import { convertRemToPixels, getTitle } from "$lib/utils";
  import { onMount } from "svelte";
  import FaCircleXMark from "$lib/components/FaXMark.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let descriptionExpand = false;
  let episodePage = 0;
  let { anime } = data;
  let maxDescription: number;
  let showExpand = false;
  let synopsisElem: HTMLElement;

  function generateRange(start: number, end: number, max: number) {
    if (end > max) end = max;
    let arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  const metaDescription = anime.synopsis.slice(
    0,
    Math.min(anime.synopsis.length - 1, 127)
  );

  onMount(async () => {
    maxDescription = convertRemToPixels(10);
    console.log(maxDescription);
    showExpand = anime.synopsis.length > maxDescription * 3; // 45 rem width * 2 characters * 3 lines
  });
</script>

<svelte:head>
  <!-- HTML Meta Tags -->
  <title>Watch {anime.title} HD in animos</title>
  <meta name="description" content={metaDescription} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content="https://animos.cf/info/{anime.kitsuId}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Watch {anime.title} HD in animos" />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={anime.coverImg} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="animos.cf" />
  <meta
    property="twitter:url"
    content="https://animos.cf/info/{anime.kitsuId}"
  />
  <meta name="twitter:title" content="Watch {anime.title} HD in animos" />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={anime.coverImg} />

  <!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

{#if anime.available}
  <section class="my-10 text-white">
    <div
      class="flex flex-col md:flex-row justify-center items-center my-5 gap-36"
    >
      <img
        src={anime.posterImg}
        alt={getTitle(anime)}
        class="w-80 rounded-lg"
      />
      <div class="flex flex-col gap-6">
        <h1 class="font-semibold text-3xl">{getTitle(anime)}</h1>
        <Genres {anime} size="large" />
        <div class="relative px-2">
          <p
            bind:this={synopsisElem}
            id="synopsis"
            class="mt-5 synopsis transition-all text-gray-200 ease-in-out duration-500"
            class:limit-lines={!descriptionExpand}
            style={descriptionExpand || !showExpand
              ? "height: max-content; line-height: 1.8rem;"
              : `height: ${maxDescription}px; line-height: 1.65rem`}
          >
            {anime.synopsis}
          </p>
          {#if showExpand && !descriptionExpand}
            <div
              class="absolute bottom-0 left-0 w-full h-full bg-black rounded-b-lg black-gradient"
            />
            <button
              class="absolute cursor-pointer"
              aria-label="expand description"
              style="bottom: -1rem;left: calc(50% - 2rem)"
              on:click={(_) => (descriptionExpand = true)}
            >
              <IconBtn ariaLabel="expand description icon">
                <FaDown />
              </IconBtn>
            </button>
          {/if}
        </div>
      </div>
    </div>
    <div class="w-full grid place-items-center">
      <div class="mt-14">
        <span class="font-semibold text-xl mt-16">Episodes</span>
        {#if anime.episodes > 100}
          <select
            class="bg-gray-200 h-fit w-fit text-sm ml-5 rounded-md"
            bind:value={episodePage}
          >
            {#each Array.from( { length: Math.ceil(anime.episodes / 100) } ) as _, index}
              <option value={index}
                >{index * 100 + 1} - {(index + 1) * 100}</option
              >
            {/each}
          </select>
        {/if}
      </div>
      <div
        style="max-width: 75%;"
        class="my-10 flex gap-5 flex-wrap justify-center items-center"
      >
        {anime.episodes}
        {#each generateRange(episodePage * 100 + 1, (episodePage + 1) * 100, anime.episodes) as epNo}
          <a
            style="width: {(anime.episodes.toString().length ?? 0) + 1.25}rem;"
            class=" bg-gray-300 text-center rounded-sm"
            href="/episode?animeId={anime.kitsuId}&episodeId={epNo}&totalEpisode={anime.episodes}"
          >
            <span class="font-semibold text-gray-800">{epNo}</span>
          </a>
        {/each}
      </div>
    </div>
  </section>
  <button
    aria-label="like"
    on:click={(_) => {
      anime.liked = !anime.liked;
      // TODO window.api.anime.setLike(anime.kitsuId, anime.liked);
    }}
    class="fixed overflow-hidden active:scale-110 w-fit rounded-lg text-gray-800 {anime.liked
      ? 'bg-accent'
      : 'bg-gray-400'} p-0 bottom-8 right-8"
  >
    <IconBtn ariaLabel="heart icon" bgAccent={false}>
      <FaHeart />
    </IconBtn>
  </button>
{:else}
  <div class="w-full h-full flex flex-col gap-12 justify-center items-center">
    <div class="w-32 text-white">
      <FaCircleXMark />
    </div>
    <h3 class="text-xl text-gray-300">Anime not available :(</h3>
  </div>
{/if}

<style>
  .black-gradient {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 32.46%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
  p {
    max-width: 45rem;
  }

  .limit-lines {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
