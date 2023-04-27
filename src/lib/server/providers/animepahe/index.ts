import axios from "axios";
import Provider, { type ProviderName } from "../generic";
import { load } from "cheerio";
import { MalSync } from "@server/helpers/malsync";
import { extractSource } from "./kwik";
import { getHlsDuration } from "../utils";

interface AnimepaheEpisodeInfo {
    duration: string,
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
    private client = axios.create({
        baseURL: this.baseUrl
    });

    async getProviderId(): Promise<string> {
        const int_id = await MalSync.getProviderId(this.malId, "animepahe");
        const originialresp = await this.client.get(`/a/${int_id}`);
        const id = originialresp.request.res.responseUrl.split("/").at(-1);
        return id;
    }

    async getEpisodes() {
        const id = await this.getProviderId();
        const response = await this.client.get<AnimePaheEpisodes>(`/api`, {
            maxRedirects: 1,
            params: {
                m: "release",
                sort: "episode_asc",
                page: 1,
                id
            }
        });
        return (response.data.data.map(ep => {
            return {
                id: ep.session,
                title: ep.title,
                number: ep.episode
            }
        }));
    }

    async getSourceInfo(episodeId: string): Promise<{ url: string; length: number; }> {
        const animeId = await this.getProviderId();

        const url = `/play/${animeId}/${episodeId}`;

        const resp = await this.client.get(url);

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

        const src = (await extractSource(bestSubSource.src) as string).replace('.cache', '.files');
        const length = await getHlsDuration(src, false);

        return {
            url: src,
            length
        }
    }
}