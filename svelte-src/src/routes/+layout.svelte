<script lang="ts">
  import "../app.postcss";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaGear from "$lib/components/FaGear.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import { accentClr, lockBody, showSettings } from "$lib/stores";
  import { onMount } from "svelte";
  import { addKeyBoardShortcuts, capitalize, lightOrDark } from "$lib/utils";
  import { page } from "$app/stores";
  import FaArrowLeft from "svelte-icons/fa/FaArrowLeft.svelte";

  import FaArrowRight from "svelte-icons/fa/FaArrowRight.svelte";
  import FaRedo from "svelte-icons/fa/FaRedo.svelte";
  import FaWindowMinimize from "svelte-icons/fa/FaWindowMinimize.svelte";
  import FaWindowMaximize from "svelte-icons/fa/FaWindowMaximize.svelte";
  import FaXMark from "$lib/components/FaXMark.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";

  let searchQuery = $page.url.searchParams.get("q") ?? "";
  let showSidebar = false;
  let marginLeft = -4.25;

  function autoCapWords() {
    searchQuery = searchQuery
      .split(" ")
      .map((word) => capitalize(word))
      .join(" ");
  }

  onMount(async () => {
    addKeyBoardShortcuts();
    console.time("Running +layout");
    let preferences = await window.api.system.getPreferences();
    console.log("Preferences:");
    console.log(preferences);
    let accent = preferences.accentColor;
    console.log("Accent color from preferences: ", accent);
    accentClr.set(accent ?? "");
    lockBody.subscribe((val) => {
      if (val) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    });
    accentClr.subscribe(async (val) => {
      console.log("setting accent to ", val);
      document.body.style.setProperty("--plyr-color-main", val);
      document.body.style.setProperty("--range-handle-focus", val);
      document.body.style.setProperty("--range-handle", val);
      document.body.style.setProperty("--accent-color", val);
      document.body.style.setProperty(
        "--accent-font",
        lightOrDark(val) == "dark" ? "white" : "black"
      );
      await window.api.system.setPreferences({ accentColor: val, id: 0 });
    });
    console.timeEnd("Running +layout");
  });
</script>

<Settings />
<Sidebar bind:show={showSidebar} />

<div class="flex flex-col gap-0 overflow-hidden">
  <div class="sticky top-0 left-0" style="z-index: 50;">
    <div class="flex justify-between px-5 py-2 bg-black title-bar text-white">
      <div class="flex gap-5">
        <button
          class="w-5 py-2 px-1 title-btn"
          on:click={(_) => history.back()}
        >
          <FaArrowLeft />
        </button>
        <button
          class="w-5 py-2 px-1 title-btn"
          on:click={(_) => location.reload()}
        >
          <FaRedo />
        </button>
        <button
          class="w-5 py-2 px-1 title-btn"
          on:click={(_) => history.forward()}
        >
          <FaArrowRight />
        </button>
      </div>
      <div class="flex gap-5">
        <button
          class="w-5 p-1 title-btn"
          on:click={(_) => window.api.system.window("minimize")}
        >
          <FaWindowMinimize />
        </button>
        <button
          class="w-5 p-1 title-btn"
          on:click={(_) => window.api.system.window("maximize")}
        >
          <FaWindowMaximize />
        </button>
        <button
          class="w-5 p-1 title-btn"
          on:click={(_) => window.api.system.window("close")}
        >
          <FaXMark />
        </button>
      </div>
    </div>
    <nav
      class="flex w-full text-white justify-between items-center px-10 py-6"
      on:mouseleave={(_) => (marginLeft = -4.25)}
    >
      <div class="flex gap-5">
        <div
          class="transition-all ease-linear duration-200"
          style="margin-left: {marginLeft}rem;"
          on:click={(_) => showSidebar = true}
          on:keydown={(e) => {
            if (e.code === "13") showSettings.set(true);
          }}
          on:mouseenter={(_) => (marginLeft = -2)}
        >
          <IconBtn>
            <FaGear />
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

  .title-bar {
    -webkit-app-region: drag;
  }

  .title-btn {
    -webkit-app-region: no-drag;
  }
</style>
