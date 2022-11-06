// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

interface AnimePopular {
	score: number, 
	animeImg: string, 
	animeTitle:string, 
	mal_id: number, 
	views:string
}

interface Anime {
	animeId:string, 
	animeTitle:string,
	animeImg:string
}

declare module 'svelte-plyr' {
	export class Plyr extends SvelteComponentTyped {}
}

declare interface Window {
	api: import("../../electron-src/preload").EndpointType,
	hls: import("hls.js").default
}