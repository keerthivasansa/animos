const genres = {
	Action: 1,
	Adventure: 2,
	'Avant Garde': 5,
	'Award Winning': 46,
	'Boys Love': 28,
	Comedy: 4,
	Drama: 8,
	Fantasy: 10,
	'Girls Love': 26,
	Gourmet: 47,
	Horror: 14,
	Mystery: 7,
	Romance: 22,
	'Sci-Fi': 24,
	'Slice of Life': 36,
	Sports: 30,
	Supernatural: 37,
	Suspense: 41
};

type MalGenre = keyof typeof genres;

export default genres;
export type { MalGenre };
