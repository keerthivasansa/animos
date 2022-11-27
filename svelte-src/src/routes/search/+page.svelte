<script lang="ts">
  import { page } from "$app/stores";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import IconTxtBtn from "$lib/components/IconTxtBtn.svelte";
  import Slider from "svelte-range-slider-pips";
  import FaFilter from "svelte-icons/fa/FaFilter.svelte";
  import BadgeSelector from "$lib/components/BadgeSelector.svelte";
  import { clickOutside } from "$lib/actions";
  import type { Anime } from "@prisma/client";
  import { onMount } from "svelte";
  // import BadgeSelector from "$lib/components/BadgeSelector.svelte";

  let query = $page.url.searchParams.get("q");
  let showFilters = false;
  let results: Anime[];

  let filters = {
    averageRating: [0, 9],
    season: [],
    year: [1960, 2022],
    text: query ?? "",
  };

  async function getSearch() {
    showFilters = false;
    let newFilters: Record<string, string> = {
      ...filters,
      averageRating: filters.averageRating.map((val) => val * 10).join(".."),
      year: filters.year.join(".."),
      season: filters.season.join(","),
    };
    let finalFilters: Record<string, string> = {};
    Object.keys(newFilters)
      .filter((key) => newFilters[key] != "")
      .forEach((key) => (finalFilters[key] = newFilters[key]));
    console.log(finalFilters);
    results = await window.api.anime.search(finalFilters);
  }

  onMount(getSearch);
</script>

<section class="mx-16 my-10 flex justify-center items-center">
  <div class="w-full h-full">
    <h1 class="text-xl font-semibold dark:text-white">
      Search: {query}
    </h1>
    <div class="mt-5 relative">
      <button on:click={(_) => (showFilters = !showFilters)}>
        <IconTxtBtn text={"Filters"}>
          <FaFilter />
        </IconTxtBtn>
      </button>
      <div
        use:clickOutside
        on:outclick={(_) => (showFilters = false)}
        class="flex {showFilters
          ? 'opacity-100'
          : 'opacity-0'} flex-col absolute z-20 transition-opacity duration-500 ease-in-out w-64 gap-3 bg-black bg-opacity-90 px-4 rounded-lg py-5 text-gray-200"
        style="top: 100%; left: 0;"
      >
        <div>
          Score: {filters.averageRating[0]} - {filters.averageRating[1]}
          <Slider
            min={0}
            max={9}
            first={true}
            last={true}
            pips={true}
            bind:values={filters.averageRating}
            range
            hoverable={false}
            pushy={false}
          />
        </div>
        <div>
          <div class="mb-2">Season:</div>
          <BadgeSelector
            values={["Fall", "Spring"]}
            bind:selected={filters.season}
          />
        </div>
        <div>
          <span>Year: {filters.year[0]} - {filters.year[1]}</span>
          <Slider min={1960} max={2022} bind:values={filters.year} range />
        </div>
        <button class="bg-accent" on:click={getSearch}>Apply</button>
      </div>
    </div>

    <div class="flex my-10 gap-5 flex-wrap">
      {#if results}
        {#if results.length == 0}
          <span class="text-gray-300">No results found</span>
        {/if}
        {#each results as anime (anime.kitsuId)}
          <CoverAnime {anime} />
        {/each}
      {/if}
    </div>
  </div>
</section>