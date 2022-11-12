/*
  Warnings:

  - You are about to drop the `Playing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `watched` on the `Episode` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Playing";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "lastWatced" DATETIME,
    "title" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "synopsis" TEXT,
    "source" TEXT,
    "sourceBackup" TEXT,

    PRIMARY KEY ("animeId", "episodeId")
);
INSERT INTO "new_Episode" ("animeId", "episodeId", "source", "sourceBackup", "synopsis", "title") SELECT "animeId", "episodeId", "source", "sourceBackup", "synopsis", "title" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
