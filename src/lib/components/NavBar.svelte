<script>
  import FaArrowLeft from "svelte-icons/fa/FaArrowLeft.svelte";
  import FaArrowRight from "svelte-icons/fa/FaArrowRight.svelte";
  import FaRedo from "svelte-icons/fa/FaRedo.svelte";
  import FaWindowMaximize from "svelte-icons/fa/FaWindowMaximize.svelte";
  import FaWindowMinimize from "svelte-icons/fa/FaWindowMinimize.svelte";
  import FaXMark from "./FaXMark.svelte";
</script>

<div class="flex justify-between px-5 py-2 bg-black title-bar text-white">
  <div class="flex gap-5">
    <button class="w-5 py-2 px-1 title-btn" on:click={(_) => history.back()}>
      <FaArrowLeft />
    </button>
    <button class="w-5 py-2 px-1 title-btn" on:click={(_) => location.reload()}>
      <FaRedo />
    </button>
    <button class="w-5 py-2 px-1 title-btn" on:click={(_) => history.forward()}>
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
