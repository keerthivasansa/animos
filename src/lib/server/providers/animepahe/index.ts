import Provider, { type ProviderName } from "../generic";
import { load } from "cheerio";
import { MalSync } from "@server/helpers/malsync";
import { extractSource } from "./kwik";
import { getHlsDuration } from "../utils";
import { createAxios } from "@server/utils/proxy";
import { getDurationFromString } from "./utils";

interface AnimepaheEpisodeInfo {
    duration: string, // 00:25:43
    session: string,
    title?: string
    episode: number
}

type AnimePaheEpisodes = {
    current_page: number,
    data: AnimepaheEpisodeInfo[],
    last_page: number
}

export default class AnimePahe extends Provider {
    public identifier: ProviderName = "animepahe";
    private baseUrl = "https://animepahe.com/";
    public malSyncId = "animepahe";
    private client = createAxios({ baseURL: this.baseUrl });

    async getProviderId(): Promise<string> {
        const int_id = await MalSync.getProviderId(this.malId, "animepahe");
        const originialresp = await this.client.get(`/a/${int_id}`);
        const id = originialresp.request.res.responseUrl.split("/").at(-1);
        return id;
    }

    async getEpisodes() {
        console.time('get id');
        const id = await this.getProviderId();
        console.log({ id });
        console.timeEnd('get id');

        console.time('get api');

        const response = await this.client.get<AnimePaheEpisodes>(`/api`, {
            maxRedirects: 1,
            params: {
                m: "release",
                sort: "episode_asc",
                page: 1,
                id
            }
        });
        console.timeEnd('get api');

        console.log(response);
        return (response.data.data.map(ep => {
            return {
                id: ep.session,
                title: ep.title,
                number: ep.episode,
                length: getDurationFromString(ep.duration)
            }
        }));
    }

    async getSourceInfo(episodeId: string, getLength = true): Promise<{ url: string; length: number; }> {
        console.time('get id');
        const animeId = await this.getProviderId();
        console.timeEnd('get id');

        const url = `/play/${animeId}/${episodeId}`;

        console.time('get referrers')
        const resp = await this.client.get(url);
        console.timeEnd('get referrers')

        const $ = load(resp.data);

        const sources = $("#resolutionMenu > button").map((index, elem) => {
            const elem$ = $(elem);
            return {
                src: elem$.data("src") as string,
                resolution: elem$.data("resolution") as number,
                audio: elem$.data("audio") as 'jpn' | 'eng'
            }
        }).toArray();

        const bestSubSource = sources.filter(src => src.audio === "jpn").sort((src1, src2) => src2.resolution - src1.resolution)[0];

        console.time('extract source')
        const src = (await extractSource(bestSubSource.src) as string).replace('.cache', '.files');
        console.timeEnd('extract source')

        if (!getLength)
            return { url: src, length: 0 };
            
        console.time('get duration');
        const length = await getHlsDuration(src, false);
        console.timeEnd('get duration');

        return {
            url: src,
            length
        }
    }
}