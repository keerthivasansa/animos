import type { Anime } from "@prisma/client";
import { api } from "../electron-src/api";

describe("Anime", () => {
  it("Fetch info for: one-piece", async () => {
    let anime = await api.anime.getInfo(12);

    expect(anime).toEqual(
      expect.objectContaining({
        kitsuId: 12,
        malId: 21,
        episodes: 1041,
        slug: "one-piece",
        dubSlug: "one-piece-dub",
        title: "One Piece",
      })
    );
  });

  it("Search for anime: death note", async () => {
    let genres = (await api.anime.search("death note")) as Anime[];
    expect(genres).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kitsuId: 1376, // it should return death note
          episodes: 37,
          title: "Death Note",
        }),
      ])
    );
  });
});
