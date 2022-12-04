<script>
  import IconBtn from "./IconBtn.svelte";
  import FaLeftArrow from "svelte-icons/fa/FaArrowLeft.svelte";
  import { onMount } from "svelte";

  let length = 1;
  function goBack() {
    history.back();
  }

  onMount(() => length = history.length);
</script>

{#if length}
  <IconBtn click={goBack}>
    <FaLeftArrow />
  </IconBtn>
{/if}
