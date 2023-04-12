<script lang="ts">
  import FaNext from "svelte-icons/fa/FaAngleRight.svelte";
  import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  interface ContinueAnime {
    anime: {
      title: string;
      img: string;
    };
    episodeId: number;
    animeId: number;
    watchTime: number;
    length?: number;
  }

  export let anime: ContinueAnime[];

  let num = anime.length;
  let itemWidth = 20;
  let maxSlideLeft = -(185 - num * itemWidth);
  let maxSlideRight = 0;
  let sliderLeft = `${maxSlideRight}rem`;

  function nextSlide() {
    let currentMargin = parseInt(sliderLeft);
    if (currentMargin == maxSlideLeft) return;
    let newVal = currentMargin - itemWidth;
    newVal = newVal > maxSlideLeft ? newVal : maxSlideLeft;
    sliderLeft = `${newVal}rem`;
  }

  function prevSlide() {
    let currentMargin = parseInt(sliderLeft);
    if (currentMargin == maxSlideRight) return;
    let newVal = currentMargin + itemWidth;
    newVal = newVal < maxSlideRight ? newVal : maxSlideRight;
    sliderLeft = `${newVal}rem`;
  }
</script>

<div class="py-3 slider relative w-screen">
  <div class="gap-5">
    <div class="px-10 mt-8 relative h-auto w-full">
      <button
        class:hidden={parseInt(sliderLeft) == maxSlideRight}
        aria-label="previous page in continue"
        on:click={prevSlide}
        class="nav-btn -left-16 top-0"
      >
        <div class="w-8">
          <FaPrev />
        </div>
      </button>
      <div
        class="flex gap-16 flex-nowrap transition-all ease-in-out duration-500"
        style="transform: translateX({sliderLeft});"
      >
        {#each anime as episode}
          <a
            href="/episode?animeId={episode.animeId}&episodeId={episode.episodeId}"
          >
            <div class="whitespace-nowrap flex flex-col gap-3">
              <img
                src={episode.anime.img}
                class="h-60 object-cover rounded-md"
                alt={episode.anime.title}
              />
              <span
                class="text-xl text-ellipsis overflow-hidden font-bold w-40"
                style=" display: inline-block;overflow: hidden;white-space: nowrap;"
                >{episode.anime.title}</span
              >
              <span class="text-sm text-slate-400"
                >Episode {episode.episodeId}</span
              >
              <ProgressBar value={episode.watchTime} max={episode.length} />
            </div>
          </a>
        {/each}
      </div>
      <button
        aria-label="next page in continue"
        class:hidden={parseInt(sliderLeft) == maxSlideLeft}
        on:click={nextSlide}
        class="nav-btn right-16 top-0"
      >
        <div class="w-7">
          <FaNext />
        </div>
      </button>
    </div>
  </div>
</div>

<style lang="postcss">
  .nav-btn {
    @apply absolute transition-all ease-linear duration-150 opacity-0 w-40 bg-opacity-95 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white h-full;
  }
  .nav-btn:hover {
    opacity: 1;
  }
  .hidden {
    display: none;
  }
</style>
