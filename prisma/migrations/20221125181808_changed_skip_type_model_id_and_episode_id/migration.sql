/*
  Warnings:

  - The primary key for the `Episode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SkipTime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `episodeId` on the `SkipTime` table. All the data in the column will be lost.
  - Added the required column `episodeAnimeKitsuId` to the `SkipTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `episodeNumber` to the `SkipTime` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "title" TEXT NOT NULL,
    "id" INTEGER NOT NULL,
    "animeKitsuId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT '',

    PRIMARY KEY ("animeKitsuId", "number")
);
INSERT INTO "new_Episode" ("animeKitsuId", "id", "number", "source", "title") SELECT "animeKitsuId", "id", "number", "source", "title" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
CREATE TABLE "new_SkipTime" (
    "type" TEXT NOT NULL,
    "start" REAL NOT NULL,
    "end" REAL NOT NULL,
    "episodeAnimeKitsuId" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,

    PRIMARY KEY ("episodeAnimeKitsuId", "episodeNumber", "type"),
    CONSTRAINT "SkipTime_episodeAnimeKitsuId_episodeNumber_fkey" FOREIGN KEY ("episodeAnimeKitsuId", "episodeNumber") REFERENCES "Episode" ("animeKitsuId", "number") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SkipTime" ("end", "start", "type") SELECT "end", "start", "type" FROM "SkipTime";
DROP TABLE "SkipTime";
ALTER TABLE "new_SkipTime" RENAME TO "SkipTime";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
