<script lang="ts">
  import { page } from "$app/stores";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import { Skeleton } from "flowbite-svelte";

  let keyword = ". . .";

  async function getSearch() {
    let query = $page.url.searchParams.get("q");
    if (!query) {
      console.log("no search");
      query = "";
    }
    keyword = query;
    let result = await window.api.anime.search(query);
    console.log(result);
    return result;
  }
</script>

<section class="mx-16 my-10 flex justify-center items-center">
  <div>
    <h1 class="text-xl font-semibold dark:text-white">
      Search: {keyword}
    </h1>
    <div class="flex my-10 gap-5 flex-wrap">
      {#await getSearch()}
        <div class="m-6">
          <Skeleton />
        </div>
      {:then results}
        {#each results as anime (anime.kitsuId)}
          <CoverAnime {anime} />
        {/each}
      {/await}
    </div>
  </div>
</section>
