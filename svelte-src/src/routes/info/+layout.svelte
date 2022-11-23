<script lang="ts">
  import { page } from "$app/stores";

  let breadStr = $page.url.searchParams.get("bread");
  let pageTitle = $page.url.searchParams.get("title");
  let breads: string[] = [];
  if (breadStr) {
    breads = breadStr.split(",");
  }
</script>

<main class="mx-10 my-5 text-white">
  <div class="text-sm mt-5 mb-10">
    <a href="/">Home</a> /
    {#if breadStr}
      <a href="/genre/{breads[0]}">{breads[0]}</a> /
    {/if}
    <span class="limit">{pageTitle}</span>
  </div>
  <slot />
</main>

<style>
  .limit,
  a {
    max-width: 3rem;
    text-overflow: ellipsis;
  }
</style>
