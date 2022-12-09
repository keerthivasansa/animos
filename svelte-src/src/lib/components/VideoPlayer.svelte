<script lang="ts">
  import Hls from "hls.js";
  import Plyr from "plyr";
  import type { Options as PlyrOptions } from "plyr";
  import { onDestroy, onMount } from "svelte";
  import type { EpisodeWithSkip } from "$lib/types";
  import type { SkipTime } from "@prisma/client";

  export let episode: EpisodeWithSkip;
  export let hasNextEp: boolean;
  let src = episode.source;
  let saveProgressInterval: NodeJS.Timer;

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
    console.log("Checking expiry for URL:", url);
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();

      xhr.open("HEAD", url);

      xhr.onload = () => res(false);
      xhr.onerror = () => res(true);

      xhr.send();
    });
  }

  async function initVideoPlayer(): Promise<Plyr> {
    console.log("AnimeID:", episode.animeKitsuId);
    let linkExpired = await isSourceExpired(src);
    if (linkExpired) {
      console.log("Link expired, fetching new link . . .");
      alert("Renewing video source, please wait for a few seconds . . .");
      src = await window.api.episode.renewSource(
        episode.animeKitsuId,
        episode.number
      );
      console.log(src);
    }
    return new Promise((res, _) => {
      const video = document.getElementById("player") as HTMLVideoElement;
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
      if (!src.endsWith(".mp4") && Hls.isSupported()) {
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

          player.on("loadedmetadata", () => {
            console.log("getting skip times");
            if (episode.skipTimes.length) return;
            window.api.episode
              .getSkipTimes(
                episode.animeKitsuId,
                episode.number,
                Math.ceil(player.duration)
              )
              .then((result) => {
                episode.skipTimes = result;
              });
          });
          res(player);
        });
        window.hls = hls;
        return;
      }
      const player = new Plyr(video);
      res(player);
    });
  }
  let fullscreen = false;
  onMount(async () => {
    // default options with no quality update in case Hls is not supported

    let player = await initVideoPlayer();

    player.on("error", (err) => {
      console.log("Plyr error:");
      console.log(err);
    });

    window.player = player;

    await player.play();
    player.currentTime = episode.watchTime;

    if (player.duration && !episode.length) {
      console.log("Setting episode length:", player.duration);
      window.api.episode.setLength(
        episode.animeKitsuId,
        episode.number,
        player.duration
      );
    }

    console.log(episode.skipTimes);

    console.log("Waiting for canplay event");

    console.log("Skip times:");
    console.log(episode.skipTimes);

    saveProgressInterval = setInterval(() => {
      window.api.episode.setWatchTime(
        episode.animeKitsuId,
        episode.number,
        player.currentTime
      );
    }, 5000);

    const btn = document.getElementById("skip-btn") as HTMLButtonElement;

    setInterval(() => {
      currentSkip = null;
      let show = false;
      episode.skipTimes.forEach((skip, index) => {
        if (
          player.currentTime > skip.start - 5 &&
          player.currentTime < skip.end - 5
        ) {
          show = true;
          btn.innerText = skip.type == "op" ? "Skip intro" : "Skip outro";
          btn.onclick = () => {
            player.currentTime = skip.end - 5;
          };
        }
      });
      if (show) {
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      }
    }, 1000);

    player.on("enterfullscreen", () => {
      fullscreen = true;
      btn.style.fontSize = "1rem";
    });
    player.on("exitfullscreen", () => {
      fullscreen = false;
      btn.style.fontSize = "0.75rem";
    });

    player.on("ended", () => {
      if (hasNextEp) {
        location.href = `/episode?animeId=${episode.animeKitsuId}&episodeId=${
          episode.number + 1
        }`;
      }
    });

    // btn.innerText = "Hello";
    btn.style.position = "absolute";
    btn.style.bottom = "4.5rem";
    btn.style.background = "black";
    btn.style.fontSize = "0.75rem";
    btn.style.right = "2rem";
    btn.style.opacity = "85%";
    btn.style.display = "none";
    btn.style.zIndex = "9999";
    btn.classList.add("skip-btn");
    player.elements.container?.append(btn);
  });

  onDestroy(() => clearInterval(saveProgressInterval));
</script>

<button id="skip-btn" class:hidden={false} />

<div class="relative">
  <video
    id="player"
    controls
    style="border-radius: 12px"
    class:limit-size={!fullscreen}
  >
    <source {src} />
    <track src="" kind="captions" />
  </video>
</div>

<style>
  .limit-size {
    height: 32vw;
  }

  @media (min-width: 1400px) {
    .limit-size {
      width: 100%;
      height: calc(width * 9 / 16);
    }
  }

  @media (max-height: 750px) {
    .limit-size {
      height: 50vh;
    }
  }

  @media (max-width: 750px) {
    .limit-size {
      width: 100%;
      height: 55vw;
    }
  }
</style>
