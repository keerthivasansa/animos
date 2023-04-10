import { db } from "$lib/trpc/db";

export class GlobalService {
  private static readonly id = 1;

  static async getGlobal() {
    let global = await db.global.findUnique({ where: { id: this.id } });
    if (global === null) {
      global = await db.global.create({
        data: {
          id: 1,
          visits: 0,
        },
      });
    }
    return global;
  }

  static async addVisit() {
    await db.global.update({
      where: { id: this.id },
      data: {
        visits: {
          increment: 1,
        },
      },
    });
  }
}
