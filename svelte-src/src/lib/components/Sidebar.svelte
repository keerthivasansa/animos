<script>
  import { clickOutside } from "$lib/actions";
  import { showSettings } from "$lib/stores";
  import FaXMark from "./FaXMark.svelte";

  export let show = false;

  function close() {
    show = false;
  }
</script>

<section
  use:clickOutside
  on:outclick={() => (show = false)}
  class="absolute top-12 h-full px-5 py-4 bg-darker text-base text-white transition-all duration-500 ease-in-out"
  style={`z-index: 100; ${show ? "left:0;" : "left:-32rem;"}`}
>
  <div class="flex px-2 w-full justify-end">
    <button
      on:click={(_) => (show = false)}
      class="w-7 bg-accent px-2 right-0 py-1 text-right rounded-full"
    >
      <FaXMark />
    </button>
  </div>
  <div class="flex flex-col gap-10 text-left items-start pl-2 pr-16 py-8">
    <a href="/popular" on:click={close}>Popular</a>
    <a href="/genre" on:click={close}>Genre</a>
    <a href="#history" on:click={close}>History</a>
    <a
      href="#settings"
      on:click={(_) => {
        showSettings.set(true);
        show = false;
      }}>Settings</a
    >
  </div>
</section>
