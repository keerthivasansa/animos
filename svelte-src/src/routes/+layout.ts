export const prerender = true;

declare interface Window {
	api: {
		hello: (name:string) => void, 
		popularAnime: () => string,
		animeInfo: (animeId:string) => number,
		episodeSource: (episodeId:string) => never,
	}		
}

