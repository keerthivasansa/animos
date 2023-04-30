import type { Prisma } from '@prisma/client';
import db from '@server/database';

class AnimeModel {
	static async insertOrUpdate(anime: Prisma.AnimeCreateInput) {
		const result = await db.anime.upsert({
			create: anime,
			update: anime,
			where: {
				malId: anime.malId
			}
		});
		return result;
	}
}

export default AnimeModel;
