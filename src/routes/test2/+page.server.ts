import { AnimeService } from "@server/services/anime";

export const load = async () => {
	const anime = new AnimeService(1535);
	await anime.getSource('HTmZDso=');
};
