export type ConsumetInfoResponse = {
	id: string;
	title: string;
	url: string;
	image: string;
	releaseDate: string | null; // or null
	description: string | null; // or null
	genres: [string];
	// subOrDub: sub,
	type: string | null; // or null
	// status: Ongoing,
	otherName: string; // or null
	totalEpisodes: number;
	episodes: [
		{
			id: string;
			dubId?: string;
			title?: string;
			number: number;
			isFiller: boolean;
		}
	];
};

export type SourceResponse = {
	headers: {
		Referer: string;
		watchsb: string; // or null, since only provided with server being equal to streamsb.
		'User-Agent': string; // or null
	};
	sources: [
		{
			url: string;
			quality: string;
			isM3U8: true;
		}
	];
};
