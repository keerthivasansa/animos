import type { AxiosResponse } from "axios";
import { type Element, load } from "cheerio";

export function getOriginalImageUrl(transformUrl: string) {
    const parts = transformUrl.split("/");
    parts.splice(3, 2);
    const url = parts.join("/").split("?").shift();
    if (!url)
        throw new Error("Malformed Image URL.");
    return url.replace('.jpg', '.webp');
}

export function extractTopAnimeTable(response: AxiosResponse): number[] {

    const $ = load(response.data);

    const table = $(`table.top-ranking-table`);

    const extractRow = (row: Element, index: number) => {
        const row$ = $(row);

        const titleLink = row$.find("td.title").find(".detail").find("a").first();
        const url = titleLink.attr("href");
        const idRegex = /\/anime\/(\d+)/;

        if (!url)
            throw new Error(`URL is missing in row #${index}`)

        const match = url.match(idRegex)

        if (!match)
            throw new Error("Failed to get mal id via regex.");

        return Number(match[1]);
    }

    const row = table.find(`tr.ranking-list`);

    console.log("awef");
    const result = row.toArray().map(extractRow)

    console.log(result.slice(0, 3));

    return result;
}