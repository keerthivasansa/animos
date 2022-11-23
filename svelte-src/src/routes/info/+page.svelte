<script lang="ts">
  import { page } from "$app/stores";
  import Genres from "$lib/components/Genres.svelte";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaDown from "svelte-icons/fa/FaArrowDown.svelte";
  import { getTitle } from "$lib/utils";

  let descriptionExpand = false;

  async function getAnime() {
    let kitsuId = parseInt($page.url.searchParams.get("kitsuId") ?? "");
    if (!kitsuId) {
      throw new Error("Missing kitsuId");
    }

    return await window.api.anime.info(kitsuId);
  }
</script>

{#await getAnime()}
  Loading
{:then anime}
  <div class="flex my-5 gap-36">
    <img src={anime.posterImg} alt={getTitle(anime)} class="w-80 rounded-lg" style="height: 30rem;" />
    <div class="flex flex-col gap-6">
      <h1 class="font-semibold text-3xl">{getTitle(anime)}</h1>
      <Genres {anime} size="large" />
      <!-- TODO add type -->
      <div class="relative px-2">
        <p
          class="mt-5 transition-all ease-in-out duration-500"
          class:limit-lines={!descriptionExpand}
          style={descriptionExpand ? "height: max-content;" : "height: 15rem;"}
        >
          {anime.synopsis}
        </p>
        {#if !descriptionExpand}
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
	  <div>
		<h3 class="font-semibold text-xl mt-16">Episodes</h3>
		<div class="mt-10 flex gap-5 flex-wrap max-w-xl justify-center items-center">
			{#each Array.from({ length: anime.episodes ?? 0 }) as _, index}
				<span class="w-10 text-center px-2 py-1 rounded-sm font-semibold bg-gray-300 text-black">{index}</span>
			{/each}
		</div>
	  </div>
    </div>
  </div>
{/await}

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
    line-height: 1.5rem;
    height: 15rem;
    text-overflow: ellipsis;
  }
</style>
