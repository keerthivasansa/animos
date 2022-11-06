<script lang="ts">
	import { page } from "$app/stores";
	import VideoPlayer from "$lib/components/VideoPlayer.svelte";
	import type { Episode } from "prisma/prisma-client";
    import FaPlay from "svelte-icons/fa/FaPlay.svelte"
	import { onMount } from "svelte";

    let animeId:number;
    let episodeId:number;
    let result: {
        currentEp:Episode, 
        allEpisodes:Episode[]
    };
    enum State {
        Loading,
        Finished 
    }

    let pageState:State = State.Loading;

    async function fetchEpisodeSrc() {
        pageState = State.Loading;
        let params = $page.url.searchParams;
        let episodeTempId = params.get("episodeId");
        let animeTempId = params.get("animeId");
        if (!animeTempId || !episodeTempId) {
            location.href = "/"
            animeTempId = episodeTempId = "";
        }
        animeId = parseInt(animeTempId);
        episodeId = parseInt(episodeTempId)

        console.log({ episodeId, animeId })
        let allEpisodes = await window.api.getEpisodes(animeId);
        let src = await window.api.getEpisode(animeId, episodeId);
        result = {
            currentEp: src,
            allEpisodes
        };
        console.dir(result);
        pageState = State.Finished;
    }

    function goToEp(epNo:number) {
        location.replace(`/episode?animeId=${animeId}&episodeId=${epNo}`)
    }

    onMount(fetchEpisodeSrc);
</script>

<section class="flex justify-between px-4">
        <div class="aspect-video rounded-lg fixed w-240">
            {#if pageState == State.Loading}
                <div style="width: 60rem;" class="animate-pulse aspect-video flex center bg-slate-700 rounded-lg">
                    <div class="w-10 text-slate-400">
                        <FaPlay></FaPlay>
                    </div>
                </div>
                <div class="mx-5 my-4">
                    <div class="animate-pulse bg-slate-700 w-52 h-10 rounded-lg"></div>
                </div>
            {:else} 
                <VideoPlayer src={result.currentEp.source ?? ""} animeMalId={animeId} episodeId={episodeId}/>  
                <div class="mx-5 my-4">
                    <h3 class="text-xl font-bold">{result.currentEp.title}</h3>
                </div>
            {/if}  
        </div>
        <div class="episodes-container" style="margin-left: 65rem;">
                <div class="my-14" style="width: 24rem;">
                    <h3 class="text-2xl font-bold">Episodes</h3>
                    <div class="flex gap-4 my-5 flex-col episode-wrapper">
                        {#if pageState != State.Loading}            
                            {#each result.allEpisodes as ep (ep.episodeId)}
                                <button class="cursor-pointer text-left border-slate-400 border-2 rounded-md my-2 px-3 py-2" 
                                on:click={_ => goToEp(ep.episodeId)} >{ep.episodeId}. {ep.title}
                                </button>
                            {/each}
                        {:else}
                            {#each Array.from({ length: 10}) as _}
                                <div class="bg-slate-700 h-8 rounded-md animate-pulse my-2 px-3 py-2"></div>
                            {/each}
                        {/if}

                    </div>
                    

                </div>
        </div>
</section>

<style>
    .episodes-container {
        height: 100%;
        overflow-y: auto;
    }

    .w-240 {
        width: 60rem;
    }
</style>
