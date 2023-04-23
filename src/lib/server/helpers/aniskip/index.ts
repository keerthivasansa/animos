import axios, { AxiosError } from 'axios';

export interface SkipTime {
	type: string;
	start: number;
	end: number;
}

interface AniskipResponse {
	results: {
		skipType: SkipType;
		interval: { startTime: number; endTime: number };
	}[];
}

type SkipType = "op" | "ed";
type SkipResult = Record<SkipType, { start: number, end: number }>

export class AnimeSkip {
	private static readonly baseUrl = 'https://api.aniskip.com/';
	private static readonly client = axios.create({
		baseURL: this.baseUrl
	});

	static async getSkipTimes(
		malId: number,
		episodeNum: number,
		episodeLength: number
	): Promise<SkipResult | null> {
		try {
			const aniSkip = await this.client.get<AniskipResponse>(`/v2/skip-times/${malId}/${episodeNum}`, {
				params: {
					types: ['op', 'ed'],
					episodeLength,
				}
			});

			const skip = aniSkip.data.results.reduce((prev, data) => {
				prev[data.skipType] = {
					start: data.interval.startTime,
					end: data.interval.endTime
				};
				return prev;
			}, {} as SkipResult);

			return skip;
		} catch (err) {
			if (err instanceof AxiosError && err.status == 404) {
				console.log('No skip times found');
			} else {
				console.log('unknown error while loading skip times:');
				console.log(err);
			}
			return null;
		}
	}
}
