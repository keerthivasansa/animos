/*
  Warnings:

  - The primary key for the `Episode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `animeId` on the `Episode` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `episodeId` on the `Episode` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "watched" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "synopsis" TEXT,
    "source" TEXT,
    "sourceBackup" TEXT,

    PRIMARY KEY ("animeId", "episodeId")
);
INSERT INTO "new_Episode" ("animeId", "episodeId", "source", "sourceBackup", "synopsis", "title", "watched") SELECT "animeId", "episodeId", "source", "sourceBackup", "synopsis", "title", "watched" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
