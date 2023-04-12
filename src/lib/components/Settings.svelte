<script lang="ts">
  import { clickOutside } from "$lib/actions";
  import { accentClr, showSettings } from "$lib/stores";
  import FaClose from "./FaClose.svelte";
  import IconBtn from "./IconBtn.svelte";

  let accentColor = $accentClr;

  const headers = ["Appearance", "About"];

  let currentActiveTab = "Appearance";
</script>

<div
  class:hidden={!$showSettings}
  class="w-screen h-screen flex absolute top-0 left-0 z-10 justify-center items-center"
>
  <div
    class="bg-opacity-90 rounded-md text-white"
    style="min-width: 45rem;"
    use:clickOutside={() => showSettings.set(false)}
  >
    <div
      id="header"
      class="flex bg-black justify-between rounded-t-md items-center"
    >
      <span />
      <span>Settings</span>
      <div class="bg-red-600 text-white rounded-tr-md">
        <IconBtn
          bgAccent={false}
          background="red"
          ariaLabel="Show settings"
          click={() => showSettings.set(false)}
        >
          <div class="w-3">
            <FaClose />
          </div>
        </IconBtn>
      </div>
    </div>
    <div class="flex flex-row bg-dark-1 gap-10" style="min-height: 15rem;">
      <div
        class="flex flex-col border-r-2 border-gray-400 text-gray-400 font-semibold"
      >
        {#each headers as head}
          <button
            style="border-radius:0"
            on:click={(_) => (currentActiveTab = head)}
            class="w-full header {currentActiveTab == head ? 'active' : ''}"
            >{head}</button
          >
        {/each}
      </div>
      <div id="content" class="w-full rounded-b-md py-6 text-sm bg-opacity-75">
        {#if currentActiveTab == "Appearance"}
          <div class="flex gap-2 items-center">
            <span>Accent Color: </span>
            <input
              type="color"
              class="w-5 h-5 rounded-sm"
              style="background-color: {accentColor};"
              bind:value={accentColor}
              on:input={(_) => accentClr.set(accentColor)}
            />
          </div>
        {:else if currentActiveTab == "About"}
          <div class="flex flex-col gap-3">
            <p>Version: v0.5.4</p>
            <button class="btn bg-accent accent-font">Check for updates</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .header {
    @apply h-10 px-10 py-2;
  }

  .header.active {
    @apply bg-slate-200 text-black;
  }
</style>
