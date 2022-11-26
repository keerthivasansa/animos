<script lang="ts">
  import Hls from "hls.js";
  import Plyr from "plyr";
  import type { Options as PlyrOptions } from "plyr";
  import { onDestroy, onMount } from "svelte";
  import type { EpisodeWithSkip } from "$lib/types";
  import type { SkipTime } from "@prisma/client";

  export let episode: EpisodeWithSkip;
  export let hasNextEp: boolean;
  const src = episode.source;

  let currentSkip: SkipTime | null;

  function updateQuality(newQuality: number) {
    window.hls.levels.forEach((level: any, levelIndex: number) => {
      if (level.height === newQuality) {
        console.log("Found quality match with " + newQuality);
        window.hls.currentLevel = levelIndex;
      }
    });
  }

  async function isSourceExpired(url: string): Promise<boolean> {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();

      xhr.open("HEAD", url);

      xhr.onload = () => res(false);
      xhr.onerror = () => res(true);

      xhr.send();
    });
  }

  async function initVideoPlayer(): Promise<Plyr> {
    let linkExpired = await isSourceExpired(src);
    if (linkExpired) {
      console.log("Link expired, fetching new link . . .");
      // src = (await window.api.renewSource(animeMalId, episodeId)).source
    }
    return new Promise((res, _) => {
      const video = document.getElementById("player") as HTMLVideoElement;
      video.onerror = (event, src, line, col, err) => {
        console.log("video error:");
        console.log(err);
      };
      const defaultOptions: PlyrOptions = {
        keyboard: {
          focused: true,
          global: true,
        },
        loop: {
          active: false,
        },
        markers: {
          enabled: true,
          points: episode.skipTimes.map((skip) => {
            return {
              label: skip.type == "op" ? "Intro" : "Outro",
              time: skip.start,
            };
          }),
        },
      };
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        // From the m3u8 playlist, hls parses the manifest and returns
        // all available video qualities. This is important, in this approach,
        // we will have one source on the Plyr player.
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          console.log("parsed");
          // Transform available levels into an array of integers (height values).
          const availableQualities = hls.levels.map((l) => l.height);
          // Add new qualities to option
          let quality = {
            default: 720,
            options: availableQualities,
            // this ensures Plyr to use Hls to update quality level
            // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
            forced: true,
            onChange: (e: number) => updateQuality(e),
          };
          defaultOptions.quality = quality;
          // Initialize new Plyr player with quality options
          hls.attachMedia(video);
          const player = new Plyr(video, defaultOptions);

          res(player);
        });
        window.hls = hls;
      } else {
        const player = new Plyr(video);
        res(player);
      }
    });
  }

  function savePlayback() {
    let watchTime = parseInt(window.player.currentTime.toFixed(0));
  }

  onMount(async () => {
    // default options with no quality update in case Hls is not supported

    let player = await initVideoPlayer();

    player.on("error", (err) => {
      console.log("Plyr error:");
      console.log(err);
    });

    window.player = player;

    // let PrevwatchTime = await window.api.getWatchTime(animeMalId, episodeId);

    await player.play();
    player.currentTime = 0;
    player.pause();

    let length = parseFloat(player.duration.toFixed(2));
    console.log("Episode length: ", length);
    if (!episode.skipTimes.length) {
      let skipTimes = await window.api.episode.getSkipTimes(
        episode.animeKitsuId,
        episode.number,
        length
      );
      console.log({ skipTimes });
    } else {
      console.log(episode.skipTimes);
    }

    episode.skipTimes = episode.skipTimes.map((skip) => {
      skip.end -= 5;
      skip.start -= 5;
      return skip;
    });

    player.on("progress", (event) => {
      currentSkip = null;
      episode.skipTimes.forEach((skip, index) => {
        if (player.currentTime > skip.start && player.currentTime < skip.end)
          currentSkip = skip;
      });
    });

    player.on("ended", () => {
      console.log("going to next ep");
      location.href = `/episode?animeId=${episode.animeKitsuId}&episodeId=${
        episode.number + 1
      }`;
    });
  });

  onDestroy(savePlayback);
</script>

<div class="relative">
  <video id="player" controls style="border-radius: 12px;">
    <source {src} />
    <track src="" kind="captions" />
  </video>
  {#if currentSkip}
    <button
      on:click={(_) => (window.player.currentTime = currentSkip?.end ?? 0)}
      class="absolute bottom-14 bg-black bg-opacity-95 right-5"
      >{currentSkip.type == "op" ? "Skip Intro" : "Skip Outro"}</button
    >
  {/if}
</div>
