/*
  Warnings:

  - You are about to alter the column `end` on the `SkipTime` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `start` on the `SkipTime` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SkipTime" (
    "type" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "start" REAL NOT NULL,
    "end" REAL NOT NULL,

    PRIMARY KEY ("episodeId", "type"),
    CONSTRAINT "SkipTime_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SkipTime" ("end", "episodeId", "start", "type") SELECT "end", "episodeId", "start", "type" FROM "SkipTime";
DROP TABLE "SkipTime";
ALTER TABLE "new_SkipTime" RENAME TO "SkipTime";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
