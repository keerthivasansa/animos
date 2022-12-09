<script lang="ts">
  import { page } from "$app/stores";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import type { Anime } from "@prisma/client";
  import { onMount } from "svelte";
  import { DarkPaginationNav } from "svelte-paginate";

  let pageNo = parseInt($page.url.searchParams.get("page") ?? "1");
  let result: {
    currentPage: number;
    data: Anime[];
    totalItems: number;
  };

  async function popular() {
    result = await window.api.anime.getPopular(pageNo);
  }

  onMount(popular);
</script>

<section class="my-10 text-white px-5">
  {#if result}
    <h3 class="text-2xl font-bold my-10">Most popular</h3>
    <div class="flex gap-5 flex-wrap">
      {#each result.data as anime, index}
        <div class="relative">
          {#if pageNo == 1 && index < 10}
            <CoverAnime {anime} rank={index} />
          {:else}
            <CoverAnime {anime} />
          {/if}
        </div>
      {/each}
    </div>
    <div class="my-10">
      <DarkPaginationNav
        totalItems={Math.min(result.totalItems, 2000)}
        pageSize={20}
        currentPage={result.currentPage}
        limit={2}
        showStepOptions={true}
        on:setPage={(e) => {
          location.href = "/popular?page=" + e.detail.page;
        }}
      />
    </div>
  {:else}
    Loading popular
  {/if}
</section>

<style>
</style>
