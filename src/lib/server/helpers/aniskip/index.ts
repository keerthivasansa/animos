import axios, { AxiosError } from 'axios';

export interface SkipTime {
	type: string;
	start: number;
	end: number;
}

interface AniskipResponse {
	results: {
		skipType: string;
		interval: { startTime: number; endTime: number };
	}[];
}

export class AnimeSkip {
	private static readonly baseUrl = 'https://api.aniskip.com/';
	private static readonly client = axios.create({
		baseURL: this.baseUrl
	});

	static async getSkipTimes(
		malId: number,
		episodeNum: number,
		episodeLength: number
	): Promise<SkipTime[]> {
		try {
			const aniSkip = await this.client.get<AniskipResponse>(
				`/v2/skip-times/${malId}/${episodeNum}?types[]=op&types[]=ed&episodeLength=${episodeLength}`
			);
			const skip = aniSkip.data.results.map((data) => {
				return {
					type: data.skipType,
					start: data.interval.startTime,
					end: data.interval.endTime
				};
			});
			return skip;
		} catch (err) {
			if (err instanceof AxiosError && err.status == 404) {
				console.log('No skip times found');
			} else {
				console.log('unknown error while loading skip times:');
				console.log(err);
			}
		}
		return [
			{
				start: -1,
				end: -1,
				type: 'nil'
			}
		];
	}
}
