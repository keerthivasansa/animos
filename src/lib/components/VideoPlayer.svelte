<script lang="ts">
  import Plyr from "plyr";
  import type { Options as PlyrOptions } from "plyr";
  import { onDestroy, onMount } from "svelte";
  import type { EpisodeWithSkip } from "$lib/types";
  import type { SkipTime } from "@prisma/client";
  import { addShortcut } from "$lib/utils";
  import { toasts, FlatToast, ToastContainer } from "svelte-toasts";
  import Hls, { Level } from "hls.js";
  import { getSourceUrl } from "$lib/supabase/utils";

  export let totalEpisodes: number;
  export let hasNextEp: boolean;
  export let currentEp: EpisodeWithSkip;
  export const setSourceFn = setSource;

  // Important: Changes the source of player every time
  //            episode updates

  let player: Plyr;
  let timers: {
    // saveProgress: NodeJS.Timer,
    bandwith: NodeJS.Timer;
  };

  async function initVideoPlayer(episode: EpisodeWithSkip): Promise<Plyr> {
    if (!episode) {
      throw new Error("Missing episode id");
    }
    let linkExpired = false;
    if (linkExpired) {
      console.log("Link expired, fetching new link . . .");
      toasts.add({
        description: "",
        uid: 1,
        type: "info",
        placement: "bottom-left",
        duration: 7000,
        showProgress: true,
        title: "Renewing video source",
      });
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
        i18n: {
          qualityLabel: {
            0: "Auto",
          },
        },
      };
      console.log(defaultOptions);

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
        });
        // From the m3u8 playlist, hls parses the manifest and returns
        // all available video qualities. This is important, in this approach,
        // we will have one source on the Plyr player.
        const lastSource = episode.sources.pop()!;
        console.log({ lastSource });
        const src = lastSource.url;
        console.log("Selected last source:");
        console.log(src);
        hls.loadSource(src);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          // console.log("Automatic level switchting: ", hls.autoLevelEnabled);
          // hls.currentLevel = -1;
          // const availableQualities = hls.levels.map((l) => l.width);
          // console.log(hls.levels);
          // availableQualities.unshift(0);
          // console.log(availableQualities);
          // Add new qualities to option
          // defaultOptions.quality = {
          //   default: 0,
          //   options: availableQualities,
          //   // this ensures Plyr to use Hls to update quality level
          //   forced: true,
          //   onChange: (e) => hls.currentLevel = e == 0 ? -1 : hls.levels.findIndex(level => level.width == e),
          // };
          hls.attachMedia(video);
          const player = new Plyr(video, defaultOptions);
          res(player);
        });
      } else {
        const player = new Plyr(video);
        res(player);
      }
    });
  }

  let fullscreen = false;

  async function setSource(episode: EpisodeWithSkip) {
    console.log("Setting the source for episode: " + episode.animePaheId);
    if (player) {
      console.log("Destroying player");
      player.destroy(() => console.log("Player destroyed"), false);
    }
    player = await initVideoPlayer(episode);
    console.log(player);

    window.hls = Hls;
    // default options with no quality update in case Hls is not supported

    player.on("error", (err) => {
      console.log("Plyr error:");
      console.log(err);
    });

    console.log(episode.skipTimes);

    console.log("Waiting for canplay event");

    console.log("Skip times:");
    console.log(episode.skipTimes);

    // saveProgressInterval = setInterval(() => {
    //   window.api.episode.setWatchTime(
    //     episode.animeKitsuId,
    //     episode.number,
    //     player.currentTime
    //   );
    // }, 5000);

    const btn = document.getElementById("skip-btn") as HTMLButtonElement;

    // setInterval(() => {
    //   currentSkip = null;
    //   let show = false;
    //   episode.skipTimes.forEach((skip, index) => {
    //     if (player.currentTime > skip.start && player.currentTime < skip.end) {
    //       show = true;
    //       btn.innerText = skip.type == "op" ? "Skip intro" : "Skip outro";
    //       btn.onclick = () => {
    //         player.currentTime = skip.end;
    //       };
    //     }
    //   });
    //   if (show) {
    //     btn.style.display = "block";
    //   } else {
    //     btn.style.display = "none";
    //   }
    // }, 1000);

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
        }&totalEpisode=${totalEpisodes}`;
      }
    });

    addShortcut("i", () => (player.currentTime = player.currentTime + 90));

    timers = {
      bandwith: setInterval(
        () => console.log("Bandwith: ", window.hls.bandwith),
        1500
      ),
    };

    btn.classList.add("skip-btn");
    player.elements.container?.append(btn);
  }

  onMount(() => {
    setSource(currentEp);
  });

  onDestroy(() => {
    // clearInterval(timers.saveProgress);
    clearInterval(timers.bandwith);
    player.destroy(() => console.log("Player destroyed"), false);
  });

  // onMount(() => setSource(episode));
</script>

<button id="skip-btn" class:hidden={false} />

<ToastContainer placement="bottom-right" let:data>
  <FlatToast {data} />
</ToastContainer>
<div class="relative">
  <video
    id="player"
    controls
    style="border-radius: 12px"
    class:limit-size={!fullscreen}
  >
    <source />
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

  :global(.skip-btn) {
    bottom: 4.5rem;
    background-color: black;
    font-size: 1.25rem;
    position: absolute;
    right: 2rem;
    opacity: 85%;
    display: none;
    z-index: 99;
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
