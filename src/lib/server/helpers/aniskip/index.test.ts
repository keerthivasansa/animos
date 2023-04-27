import { describe, expect, it } from 'vitest';
import { AnimeSkip } from './index';

const deathNote = {
	malId: 1535
};

const deathNoteSkipTimes = [
	{ type: 'OPENING', start: 1, end: 91 },
	{ type: 'ENDING', start: 1286, end: 1356 }
];

describe('AniSkip', () => {
	it('Death Note Episode 1 Skip Times', async () => {
		const skipTimes = await AnimeSkip.getSkipTimes(deathNote.malId, 1, 1380);
		expect(skipTimes).toMatchObject(deathNoteSkipTimes);
	});
});
