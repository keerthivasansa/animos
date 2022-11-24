<script lang="ts">
  import Carousel from "$lib/components/Carousel.svelte";
  import CoverAnime from "$lib/components/CoverAnime.svelte";
  import type { Anime } from "@prisma/client";

  async function get(id: number) {
    let anime = await window.api.anime.info(id);
    console.log(anime);
    return anime;
  }

  async function getPosters(): Promise<Anime[]> {
    let posters = await window.api.anime.posters();
    console.log(posters);
    return posters as any;
  }
</script>

{#await getPosters()}
  <!-- Add loading animation -->
  <span />
{:then trendingAnime}
  <Carousel anime={trendingAnime} />
{/await}

<section class="p-10">
  <div class="flex gap-12">
    {#await get(11110)}
      Loading anime
    {:then anime}
      <CoverAnime {anime} />
    {/await}
    {#await get(1376)}
      Loading anime
    {:then anime}
      <CoverAnime {anime} />
    {/await}
    {#await get(11209)}
      Loading anime
    {:then anime}
      <CoverAnime {anime} />
    {/await}
  </div>
</section>
