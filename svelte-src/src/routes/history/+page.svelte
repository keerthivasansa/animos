<script lang="ts">
  import { page } from "$app/stores";
  import type { EpisodeWithAnime } from "$electron-src/types";
  import History from "$lib/components/History.svelte";
  import { onMount } from "svelte";
  import { DarkPaginationNav } from "svelte-paginate";

  let result: {
    currentPage: number;
    totalItems: number;
    data: EpisodeWithAnime[];
  };

  async function getHistory(pageNum: number) {
    console.log({ pageNum });
    result = await window.api.episode.getHistory(pageNum);
  }

  onMount(async () => {
    let pageNo = parseInt($page.url.searchParams.get("page") ?? "1");
    getHistory(pageNo);
  });
</script>

<section class="my-10 text-white px-5">
  {#if result}
    <div>
      <h2 class="text-2xl font-bold my-8">Watch History</h2>
      <div class="flex gap-10 flex-wrap">
        {#each result.data as ep}
          <div class="my-5">
            <History episode={ep} />
          </div>
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
            location.href = `/history?page=${e.detail.page}`;
          }}
        />
      </div>
    </div>
  {:else}
    Loading history
  {/if}
</section>
