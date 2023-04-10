<script lang="ts">
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import FaPrev from "svelte-icons/fa/FaAngleLeft.svelte";
  import FaNext from "svelte-icons/fa/FaAngleRight.svelte";
  import { getGenreColor } from "$lib/utils";
  import { Swiper as SvelteSwiper, SwiperSlide } from "swiper/svelte";
  import { Navigation, Pagination } from "swiper";
  import type { Anime } from "@prisma/client";

  import "swiper/css";
  import "swiper/css/navigation";
  import "swiper/css/pagination";
  import { clickOutside } from "lib/actions";

  export let animeArr: Anime[];

  let focus = true;

  function getTitle(anime: Anime) {
    return anime.title_en ?? anime.title ?? anime.title_jp;
  }

  const backgroundImageCache = Array.from({ length: animeArr.length }).fill(
    false
  );

  // caches all the images together so they dont load when it comes to focus
  function cacheImages() {
    animeArr.forEach((an, index) => {
      const img = document.createElement("img");
      img.src = an.posterImg;
      img.onload = () => {
        backgroundImageCache[index] = true;
        img.remove();
      };
    });
  }
  cacheImages();
</script>

<div class="relative mt-10">
  <button class="nav-btn left-0 top-0 swiper-prev" aria-label="previous slide">
    <div class="w-8">
      <FaPrev />
    </div>
  </button>
  <SvelteSwiper
    slidesPerView={1}
    autoplay
    loop
    navigation={{
      nextEl: ".swiper-next",
      prevEl: ".swiper-prev",
    }}
    pagination={{
      clickable: true,
    }}
    modules={[Navigation, Pagination]}
  >
    {#each animeArr as anime, index}
      <SwiperSlide>
        <a href="/info/{anime.kitsuId}" class="mt-10">
          <div
            on:mouseenter={(_) => (focus = true)}
            class="md:px-2 lg:mx-5 rounded-lg relative carousel {backgroundImageCache[
              index
            ]
              ? ''
              : 'bg-slate-500 animate-pulse'}"
            style={`${
              backgroundImageCache[index]
                ? `background-image: url('${anime.coverImg}')`
                : ""
            };background-size: cover; aspect-ratio: 21 / 5; transition: background-image 500ms ease-in-out`}
          >
            <div
              class:opacity-100={focus}
              class="absolute top-0 rounded-l-lg transition-all ease-in-out duration-500 opacity-0 left-0 p-8 text-sm lg:text-base lg:px-14 lg:py-12 flex flex-col gap-10 h-full center bg-black text-white bg-opacity-95"
            >
              <h2
                title={getTitle(anime)}
                class="text-base lg:text-2xl title-box w-full max-w-xs font-semibold text-ellipsis"
              >
                {getTitle(anime)}
              </h2>
              <div class="flex gap-4">
                {#if anime.genres}
                  {#each anime.genres.split(",")?.slice(0, 3) as genre}
                    <span
                      class="text-sm px-2 py-1 rounded-sm"
                      style="background-color: {getGenreColor(genre)};"
                      >{genre}</span
                    >
                  {/each}
                {/if}
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 text-amber-400">
                  <FaStar />
                </div>
                <span>
                  {anime.score}
                </span>
                {#if ["R", "R18"].includes(anime.ageRating)}
                  <span
                    class="ml-5 bg-red-800 text-white px-2 rounded-md text-md py-1"
                    >18+</span
                  >
                {/if}
              </div>
            </div>
          </div>
        </a>
      </SwiperSlide>
    {/each}
  </SvelteSwiper>
  <button class="nav-btn right-0 top-0 swiper-next" aria-label="next slide">
    <div class="w-8">
      <FaNext />
    </div>
  </button>
</div>

<style lang="postcss">
  .title-box {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .opacity-100 {
    opacity: 1;
  }

  .carousel {
    height: 40vw;
    width: 90vw;
  }
  .nav-btn {
    @apply absolute transition-all ease-linear duration-150 opacity-0 w-40 h-full bg-opacity-80 justify-center items-center flex top-0 bg-black z-30 px-3 py-2 rounded-lg font-black text-white;
  }
  .nav-btn:hover {
    opacity: 1;
  }
  :global(.swiper-pagination) :global(.swiper-pagination-bullet-active) {
    background: var(--accent-color);
  }

  @media (min-width: 940px) {
    .carousel {
      width: 96vw;
      height: 24vw;
    }
  }
</style>
