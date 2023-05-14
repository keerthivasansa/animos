import axios, { AxiosError } from 'axios';
import { SkipType } from '@prisma/client';

export interface SkipTime {
	type: string;
	start: number;
	end: number;
}

interface AniskipResponse {
	results: {
		skipType: 'op' | 'ed';
		interval: { startTime: number; endTime: number };
	}[];
}

export class AnimeSkip {
	private static readonly baseUrl = 'https://api.aniskip.com/';
	private static readonly client = axios.create({
		baseURL: this.baseUrl
	});

	static async getSkipTimes(malId: number, episodeNum: number, episodeLength: number) {
		try {
			const aniSkip = await this.client.get<AniskipResponse>(
				`/v2/skip-times/${malId}/${episodeNum}`,
				{
					params: {
						types: ['op', 'ed'],
						episodeLength
					}
				}
			);

			const skip = aniSkip.data.results.map((data) => {
				return {
					type: data.skipType === 'op' ? SkipType.OPENING : SkipType.ENDING,
					start: parseInt(data.interval.startTime.toString()),
					end: parseInt(data.interval.endTime.toString())
				};
			});

			return skip;
		} catch (err) {
			if (err instanceof AxiosError) {
				if (err.status === 404)
					console.log('No skip times found');
				else if (err.status === 500)
					console.log("AniSkip: Internal Server Error.")
			} else {
				console.log('unknown error while loading skip times:');
				console.log(err);
			}
			return null;
		}
	}
}
