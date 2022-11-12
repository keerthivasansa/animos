/*
  Warnings:

  - You are about to drop the `AlternativeTitle` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Episode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Episode` table. All the data in the column will be lost.
  - Added the required column `englishTitle` to the `AnimeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `AnimeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `animeId` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `episodeId` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AlternativeTitle";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentAnime" TEXT,
    "currentEpisode" INTEGER,
    "googleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnimeInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "englishTitle" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL,
    "genres" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentEp" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL
);
INSERT INTO "new_AnimeInfo" ("currentEp", "genres", "id", "img", "malId", "released", "status", "synopsis", "title", "totalEpisodes", "type") SELECT "currentEp", "genres", "id", "img", "malId", "released", "status", "synopsis", "title", "totalEpisodes", "type" FROM "AnimeInfo";
DROP TABLE "AnimeInfo";
ALTER TABLE "new_AnimeInfo" RENAME TO "AnimeInfo";
CREATE TABLE "new_Episode" (
    "watched" INTEGER,
    "title" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,

    PRIMARY KEY ("animeId", "episodeId")
);
INSERT INTO "new_Episode" ("watched") SELECT "watched" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
