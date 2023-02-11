<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";

  onMount(() => {
    const src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    const video = document.getElementById("video") as HTMLMediaElement;
    if (Hls.isSupported()) {
      console.log("HLS is supported");
      var hls = new Hls({
        enableWorker: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log("HLS Parsed");
      });
    }
  });
</script>

<video controls id="video" />
