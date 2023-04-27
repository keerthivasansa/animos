import { MalSync } from '@server/helpers/malsync';
import { describe, it, expect } from 'vitest';

const deathNoteIds = {
	mal: 1535,
	gogo: 'death-note',
	animepahe: '672'
};

describe('MALSync', () => {
	it('Death note: MAL -> Gogo', async () => {
		const result = await MalSync.getProviderId(deathNoteIds.mal, 'Gogoanime');
		expect(result).toBe(deathNoteIds.gogo);
	});

	it('Death note: MAL -> animepahe', async () => {
		const result = await MalSync.getProviderId(deathNoteIds.mal, 'animepahe');
		expect(result).toBe(deathNoteIds.animepahe);
	});
});
