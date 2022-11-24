<script lang="ts">
  import { page } from "$app/stores";
  import Genres from "$lib/components/Genres.svelte";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaDown from "svelte-icons/fa/FaArrowDown.svelte";
  import { capitalize, convertRemToPixels, getTitle } from "$lib/utils";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import FaUp from "svelte-icons/fa/FaArrowUp.svelte";
  import IconTxtBtn from "$lib/components/IconTxtBtn.svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  let descriptionExpand = false;
  let relatedExpand = false;
  let kitsuId = parseInt($page.params.kitsuId ?? "");

  export let data: PageData;

  let { anime } = data;
  async function getRelated() {
    return await window.api.anime.related(kitsuId);
  }

  let maxDescription: number;
  let showExpand = false;
  let synopsisElem: HTMLElement;

  onMount(() => {
    maxDescription = convertRemToPixels(9);
    showExpand = (synopsisElem?.clientHeight ?? 0) > maxDescription;
    console.log("Height:");
    console.log({ height: synopsisElem?.offsetHeight, maxDescription });
  });
</script>

<div class="flex my-5 gap-36">
  <img
    src={anime.posterImg}
    alt={getTitle(anime)}
    class="w-80 rounded-lg"
    style="height: 30rem;"
  />
  <div class="flex flex-col gap-6">
    <h1 class="font-semibold text-3xl">{getTitle(anime)}</h1>
    <Genres {anime} size="large" />
    <!-- TODO add type -->
    <div class="relative px-2">
      <p
        bind:this={synopsisElem}
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
        <div
          class="absolute cursor-pointer"
          style="bottom: -1rem;left: calc(50% - 2rem)"
          on:click={(_) => (descriptionExpand = true)}
        >
          <IconBtn>
            <FaDown />
          </IconBtn>
        </div>
      {/if}
    </div>
    <div class="mt-10">
      <div on:click={(_) => (relatedExpand = !relatedExpand)}>
        <IconTxtBtn text={"Related"}>
          {#if relatedExpand}
            <FaUp />
          {:else}
            <FaDown />
          {/if}
        </IconTxtBtn>
      </div>
      {#if relatedExpand}
        {#await getRelated() then related}
          <div>
            {#each Object.keys(related) as role}
              {#if related[role].length > 0}
                <h3 class="font-semibold my-6">{capitalize(role)}</h3>
                <div class="flex gap-10 flex-wrap w-full">
                  {#each related[role] as relatedAnime}
                    <CoverAnime anime={relatedAnime} infoOnHover={false} />
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        {/await}
      {/if}
    </div>
    <div>
      <h3 class="font-semibold text-xl mt-16">Episodes</h3>
      <div
        class="mt-10 flex gap-5 flex-wrap max-w-xl justify-center items-center"
      >
        {#each Array.from({ length: anime.episodes ?? 0 }) as _, index}
          <span
            class="w-10 text-center px-2 py-1 rounded-sm font-semibold bg-gray-300 text-black"
            >{index}</span
          >
        {/each}
      </div>
    </div>
  </div>
</div>

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
