<script lang="ts">
  import "../app.postcss";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import { accentClr, lockBody } from "$lib/stores";
  import { onMount } from "svelte";
  import {
    addKeyBoardShortcuts,
    capitalize,
    isElectron,
    lightOrDark,
  } from "$lib/utils";
  import { page } from "$app/stores";
  import FaHamburger from "svelte-icons/fa/FaBars.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import NavBar from "$lib/components/NavBar.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  let searchQuery = $page.url.searchParams.get("q") ?? "";
  let showSidebar = false;
  let marginLeft = -4.25;

  function autoCapWords() {
    searchQuery = searchQuery
      .split(" ")
      .map((word) => capitalize(word))
      .join(" ");
  }

  onMount(() => {
    addKeyBoardShortcuts();
    console.time("Running +layout");
    let accent = "#f09c2e"
    if (data && data.user && data.user.accentColor) {
      accent = data.user.accentColor;
    }
    console.log("Accent color from preferences: ", accent);
    accentClr.set(accent);
    lockBody.subscribe((val) => {
      if (val) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    });
    accentClr.subscribe((val) => {
      console.log("setting accent to ", val);
      document.body.style.setProperty("--plyr-color-main", val);
      document.body.style.setProperty("--range-handle-focus", val);
      document.body.style.setProperty("--range-handle", val);
      document.body.style.setProperty("--accent-color", val);
      document.body.style.setProperty(
        "--accent-font",
        lightOrDark(val) == "dark" ? "white" : "black"
      );
    });
    console.timeEnd("Running +layout");
  });
</script>

<Settings />
<Sidebar bind:show={showSidebar} />

<svelte:head>
  <title>animos | Redefining free streaming</title>
</svelte:head>

<div class="flex flex-col gap-0 overflow-hidden">
  <div class="sticky top-0 left-0" style="z-index: 50;">
    <svelte:component this={isElectron ? NavBar : null} />
    <nav
      class="flex w-full text-white justify-between items-center px-10 py-6"
      on:mouseleave={(_) => (marginLeft = -4.25)}
    >
      <div class="flex gap-5">
        <div
          class="transition-all ease-linear duration-200"
          style="margin-left: {marginLeft}rem;"
          on:click={(_) => (showSidebar = true)}
          on:keydown={(e) => {
            if (e.code === "13") showSidebar = true;
          }}
          on:mouseenter={(_) => (marginLeft = -2)}
        >
          <IconBtn>
            <FaHamburger />
          </IconBtn>
        </div>
        <a href="/">
          <Logo />
        </a>
      </div>
      <div class="flex gap-2">
        <form action="/search">
          <input
            type="text"
            name="q"
            id="search-input"
            bind:value={searchQuery}
            on:input={autoCapWords}
            class="rounded-md {searchQuery == ''
              ? 'w-32'
              : 'w-60'} font-semibold px-4 py-2 focus:w-60 transition-all ease-in-out duration-200"
          />
          <button type="submit">
            <IconBtn>
              <FaSearch />
            </IconBtn>
          </button>
        </form>
      </div>
    </nav>
  </div>
  <main class="scrollable relative">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    overflow: hidden !important;
  }

  .scrollable {
    overflow-y: auto;
    overflow-x: hidden;
    height: 85vh;
  }
</style>
