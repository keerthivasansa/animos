import { transformKitsuToAnime } from "./utils";

export async function search(
  filters: Record<string, any>,
  page: number,
  otherParams: Record<string, string> = {}
) {
  const searchUrl = "https://kitsu.io/api/edge/anime";
  const searchParams = new URLSearchParams();
  searchParams.set("include", "categories,mappings");
  searchParams.set("page[limit]", "20");
  searchParams.set("page[offset]", ((page - 1) * 20).toString());
  Object.keys(filters).forEach((k) => {
    searchParams.set(`filter[${k}]`, filters[k]);
  });
  Object.keys(otherParams).forEach((k) => {
    searchParams.set(k, otherParams[k]);
  });
  console.log({ params: decodeURIComponent(searchParams.toString()) });
  const resp = await fetch(searchUrl + "?" + searchParams.toString());
  const data = await resp.json();
  if (data.meta.count == 0) return { data: [], totalItems: 0, currentPage: 1 };
  const categorieObjs = data.included.filter(
    (obj: { type: string }) => obj.type == "categories"
  );
  console.log(categorieObjs[0]);
  const result = data.data
    .filter(
      (anime: { relationships: { mappings: { data: string | any[] } } }) =>
        anime.relationships.mappings.data.length > 0
    )
    .map((anime: Record<string, any>) => {
      const t_anime = transformKitsuToAnime(anime);
      const categoryIds = anime.relationships.categories.data.map(
        (cat: { id: any }) => cat.id
      );
      console.log(categoryIds);
      const categories = categoryIds.map(
        (cat: any) =>
          categorieObjs.filter((obj: { id: any }) => obj.id == cat)[0]
            .attributes.title
      );
      console.log(categories);
      t_anime.genres = categories.join(",");
      t_anime.slug = "";
      return t_anime;
    });
  console.timeEnd("search");
  return { data: result, totalItems: data.meta.count, currentPage: page };
}
