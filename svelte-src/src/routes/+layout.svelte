<script lang="ts">
  import "../app.postcss";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaGear from "$lib/components/FaGear.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import { accentClr, showSettings } from "$lib/stores";
  import { onMount } from "svelte";
  import { capitalize, lightOrDark } from "$lib/utils";
  import { page } from "$app/stores";

  let searchQuery = $page.url.searchParams.get("q") ?? "";

  let marginLeft = -4.25;

  function autoCapWords() {
    searchQuery = searchQuery
      .split(" ")
      .map((word) => capitalize(word))
      .join(" ");
  }

  onMount(async () => {
    let accent = getComputedStyle(document.body)
      .getPropertyValue("--accent-color")
      .trim();
    document.body.style.setProperty(
      "--accent-font",
      lightOrDark(accent) == "dark" ? "white" : "black"
    );
    accentClr.subscribe((val) => {
      document.body.style.setProperty("--plyr-color-main", val);
      document.body.style.setProperty("--accent-color", val);
      document.body.style.setProperty(
        "--accent-font",
        lightOrDark(val) == "dark" ? "white" : "black"
      );
    });
  });
</script>

<Settings />
<nav
  class="flex text-white justify-between items-center px-10 py-6"
  on:mouseleave={(_) => (marginLeft = -4.25)}
>
  <div class="flex gap-5">
    <div
      class="transition-all ease-linear duration-200"
      style="margin-left: {marginLeft}rem;"
      on:click={(_) => showSettings.set(true)}
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
<slot />
