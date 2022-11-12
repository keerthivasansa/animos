/*
  Warnings:

  - You are about to drop the column `summary` on the `Episode` table. All the data in the column will be lost.
  - Added the required column `synopsis` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Made the column `watched` on table `Episode` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "EpisodeSrc" (
    "episodeId" INTEGER NOT NULL,
    "animeMalId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceBackup" TEXT NOT NULL,

    PRIMARY KEY ("animeMalId", "episodeId")
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "watched" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,

    PRIMARY KEY ("animeId", "episodeId")
);
INSERT INTO "new_Episode" ("animeId", "episodeId", "title", "watched") SELECT "animeId", "episodeId", "title", "watched" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
