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
  import { DarkPaginationNav, PaginationNav } from "svelte-paginate";

  let query = $page.url.searchParams.get("q");
  let showFilters = false;
  let results: { data: Anime[]; totalItems: number; currentPage: number };

  let filters = {
    averageRating: [0, 100],
    season: [],
    year: [1960, 2022],
    text: query ?? "",
    subtype: [],
    ageRating: [],
    page: 1,
  };

  async function getSearch() {
    showFilters = false;

    let newFilters: Record<string, string> = {
      averageRating: filters.averageRating.join(".."),
      text: filters.text,
      year: filters.year.join(".."),
      season: filters.season.map((val: string) => val.toLowerCase()).join(","),
      subtype: filters.subtype
        .map((val: string) => val.toLowerCase())
        .join(","),
      ageRating: filters.ageRating.join(","),
    };
    let finalFilters: Record<string, string> = {};
    Object.keys(newFilters)
      .filter((key) => newFilters[key] != "")
      .forEach((key) => (finalFilters[key] = newFilters[key]));
    console.log(finalFilters);
    results = await window.api.anime.search(finalFilters, filters.page);
    console.log("Results:");
    console.log(results);
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
        class="{showFilters
          ? 'opacity-100 z-20'
          : 'opacity-0 -z-10'} flex flex-col absolute transition-all duration-500 ease-in-out gap-3 bg-black bg-opacity-90 px-4 rounded-lg py-5 text-gray-200"
        style="top: 100%; left: 0;"
      >
        <div>
          Score: {filters.averageRating[0]} - {filters.averageRating[1]}
          <Slider
            min={0}
            max={100}
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
            values={["Fall", "Spring", "Winter", "Summer"]}
            bind:selected={filters.season}
          />
        </div>

        <div>
          <div class="mb-2">Age Rating:</div>
          <BadgeSelector
            values={["PG", "G", "R", "R18"]}
            bind:selected={filters.ageRating}
          />
        </div>
        <div>
          <div class="mb-2">Type:</div>
          <BadgeSelector
            values={["TV", "OVA", "ONA", "Movie", "Special"]}
            bind:selected={filters.subtype}
          />
        </div>
        <div>
          <span>Year: {filters.year[0]} - {filters.year[1]}</span>
          <Slider min={1960} max={2022} bind:values={filters.year} range />
        </div>
        <button class="bg-accent" on:click={getSearch}>Apply</button>
      </div>
    </div>

    {#if results}
      {#if results.data.length == 0}
        <span class="text-gray-300">No results found</span>
      {/if}
      <div class="flex my-10 gap-5 flex-wrap">
        {#each results.data as anime (anime.kitsuId)}
          <CoverAnime {anime} />
        {/each}
      </div>
      {#if results.totalItems > 0}
        <div class="w-full center paginate">
          <DarkPaginationNav
            totalItems={results.totalItems}
            pageSize={20}
            currentPage={results.currentPage}
            limit={2}
            showStepOptions={true}
            on:setPage={(e) => {
              filters.page = e.detail.page;
              getSearch();
            }}
          />
        </div>
      {/if}
    {/if}
  </div>
</section>

<style>
  .paginate :global(.option),
  .paginate :global(.option.prev),
  .paginate :global(.option.next) {
    color: white;
  }

  .paginate :global(.option.active),
  :global(.option.disabled) {
    color: grey;
  }
</style>
