<script lang="ts">
  import { accentClr } from "$lib/stores";
  import { lightOrDark } from "$lib/utils";

  export let bgAccent = true;
  export let click: Function = () => null;
  export let background = "";

  let fontColor = "";

  accentClr.subscribe((val) => {
    if (!bgAccent) return;
    let clrType = lightOrDark(val);
    fontColor = clrType == "dark" ? "text-white" : "text-black";
    console.log({ fontColor, clrType, val });
  });
</script>

<button
  on:click={(_) => click()}
  class:bg-accent={bgAccent}
  style={!bgAccent ? `background-color:${background}` : ""}
  class="w-10 h-10 p-3 justify-center items-center flex rounded-md {fontColor}"
>
  <slot />
</button>
