<script lang="ts">
  import "../app.postcss";
  import IconBtn from "$lib/components/IconBtn.svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaGear from "$lib/components/FaGear.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import Settings from "$lib/components/Settings.svelte";
  import { accentClr, lockBody, showSettings } from "$lib/stores";
  import { onMount } from "svelte";
  import { capitalize, lightOrDark } from "$lib/utils";
  import { page } from "$app/stores";
  import { doc } from "prettier";
  import { clickOutside } from "$lib/actions";

  let searchQuery = $page.url.searchParams.get("q") ?? "";

  let marginLeft = -4.25;

  function autoCapWords() {
    searchQuery = searchQuery
      .split(" ")
      .map((word) => capitalize(word))
      .join(" ");
  }

  async function getUpdates() {
    let update = await window.api.system.getUpdates();
    if (!update.version) {
      console.log("No update found");
      return;
    }
    showUpdate = true;
    lockBody.set(true);
    let notes: any[] = update.releaseNotes
      .split("<")
      .map((val) => val.trim().split(">")[1])
      .filter((val) => val != "" && val != undefined);
    [undefined, "CHANGELOG"].forEach((avoidVal) => {
      if (notes.includes(avoidVal)) {
        notes.splice(notes.indexOf(avoidVal), 1);
      }
    });
    console.log(notes);
    return {
      version: update.version,
      notes,
    };
  }
  let showUpdate = false;

  function closeUpdateDialog() {
    lockBody.set(false);
    showUpdate = false;
  }

  onMount(async () => {
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

{#await getUpdates() then updateCheckResult}
  {#if showUpdate}
    <div
      class="w-screen h-screen flex z-50 justify-center bg-black bg-opacity-40 items-center overflow-hidden fixed top-0 left-0"
    >
      <div
        use:clickOutside
        on:outclick={(_) => closeUpdateDialog()}
        class="rounded-lg text-white bg-gray-700 flex gap-4 flex-col font-semibold px-10 py-8"
      >
        <h3 class="text-3xl my-4">Update Found</h3>
        <span class="my-2">Version: {updateCheckResult.version}</span>
        <div>
          <div>Notes:</div>
          <div class="text-sm h-fit w-fit font-normal flex flex-col gap-2">
            <ul>
              {#each updateCheckResult.notes as note}
                <li class="list-decimal">{note}</li>
              {/each}
            </ul>
          </div>
        </div>
        <button
          class="bg-accent"
          on:click={(_) => {
            window.api.system.downloadUpdate();
            closeUpdateDialog();
          }}>Install</button
        >
      </div>
    </div>
  {/if}
{/await}

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
