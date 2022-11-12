/*
  Warnings:

  - You are about to drop the column `lastWatced` on the `Episode` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "lastWatched" DATETIME,
    "title" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "synopsis" TEXT,
    "source" TEXT,
    "sourceBackup" TEXT,

    PRIMARY KEY ("animeId", "episodeId")
);
INSERT INTO "new_Episode" ("animeId", "episodeId", "source", "sourceBackup", "synopsis", "title", "watchTime") SELECT "animeId", "episodeId", "source", "sourceBackup", "synopsis", "title", "watchTime" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
