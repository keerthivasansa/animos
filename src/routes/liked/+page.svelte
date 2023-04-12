<script lang="ts">
  import CoverAnime from "$lib/components/CoverAnime.svelte";

  function getLikedAnime() {
    // TODO Implement user liked anime system.
    return [];
  }
</script>

<section class="mx-10 my-10">
  {#await getLikedAnime()}
    <span>Loading the anime(s) you have liked . . .</span>
  {:then animeArr}
    <h1 class="text-3xl text-white font-semibold">Liked Anime</h1>
    <div class="flex flex-row flex-wrap mt-10 gap-12">
      {#each animeArr as anime}
        <CoverAnime {anime} />
      {/each}
    </div>
  {/await}
</section>
