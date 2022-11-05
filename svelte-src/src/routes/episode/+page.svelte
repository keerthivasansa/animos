<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import VideoPlayer from "$lib/components/VideoPlayer.svelte";
	import type { Episode } from "prisma/prisma-client";
	import { onMount } from "svelte";

    let animeId:string;
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
        let episodeId = params.get("episodeId");
        let animeTempId = params.get("animeId");
        if (!animeTempId || !episodeId) {
            location.href = "/"
            animeTempId = episodeId = "";
        }
        animeId = animeTempId;
        let episodeNum = parseInt(episodeId);
        let animeMalId= parseInt(animeId);
        console.log({ episodeNum, animeMalId})
        let allEpisodes = await window.api.getEpisodes(animeMalId);
        let src = await window.api.getEpisode(animeMalId, episodeNum);
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
    {#if pageState == State.Loading}
        Loading src please wait
    {:else} 
        <div class="aspect-video rounded-lg fixed" style="width: 60rem;">
            <VideoPlayer src={result.currentEp.source ?? ""}/>  
            <div class="mx-5 my-4">
                <h3 class="text-xl font-bold">{result.currentEp.title}</h3>
            </div>  
        </div>
        <div class="episodes-container" style="margin-left: 65rem;">
            <div class="my-14" style="width: 24rem;">
                <h3 class="text-2xl font-bold">Episodes</h3>
                <div class="flex gap-4 my-5 flex-col episode-wrapper">
                    {#each result.allEpisodes as ep (ep.episodeId)}
                        <button class="cursor-pointer text-left border-slate-400 border-2 rounded-md my-2 px-3 py-2" 
                        on:click={_ => goToEp(ep.episodeId)} >{ep.episodeId}. {ep.title}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</section>

<style>
    .episodes-container {
        height: 100%;
        overflow-y: auto;
    }

</style>
