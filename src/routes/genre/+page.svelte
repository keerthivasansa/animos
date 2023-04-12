<script lang="ts">
  import { page } from "$app/stores";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import type { Anime } from "@prisma/client";
  import { onMount } from "svelte";
  import { DarkPaginationNav } from "svelte-paginate";

  let pageNo = parseInt($page.url.searchParams.get("page") ?? "1");
  let genre = $page.url.searchParams.get("genre");
  let genreSelect: string;
  let result: {
    currentPage: number;
    data: Anime[];
    totalItems: number;
  };

  async function getGenre(genre: string) {
    // TODO Implement genre wise search.
    result = { currentPage: 1, totalItems: 0, data: [] };
  }

  function getGenreNames() {
    return [];
  }

  onMount(() => {
    if (!genre) return;
    getGenre(genre);
  });
</script>

<section class="my-10 text-white px-5">
  {#if genre}
    {#if result}
      <h3 class="text-2xl font-bold my-10">{genre}</h3>
      <div class="flex gap-5 flex-wrap">
        {#each result.data as anime}
          <CoverAnime {anime} />
        {/each}
      </div>
      <div class="my-10">
        <DarkPaginationNav
          totalItems={result.totalItems}
          pageSize={20}
          currentPage={result.currentPage}
          limit={2}
          showStepOptions={true}
          on:setPage={(e) => {
            location.href = `/genre?genre=${genre}&page=${e.detail.page}`;
          }}
        />
      </div>
    {:else}
      Loading animes in genre: {genre}
    {/if}
  {:else}
    <p>Select any one of genres:</p>
    {#await getGenreNames() then genres}
      <select class="rounded-lg mx-2 my-4" bind:value={genreSelect}>
        {#each genres as genre}
          <option value={genre}>{genre}</option>
        {/each}
      </select>
      <button
        class="btn bg-accent"
        on:click={(_) => {
          genre = genreSelect;
          getGenre(genre);
        }}>Search</button
      >
    {/await}
  {/if}
</section>

<style>
</style>
