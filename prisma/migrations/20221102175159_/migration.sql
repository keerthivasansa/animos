/*
  Warnings:

  - You are about to drop the column `currentEp` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `released` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `synopsis` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `totalEpisodes` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Anime` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AnimeInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "malId" INTEGER NOT NULL,
    "totalEpisodes" INTEGER NOT NULL,
    "genres" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentEp" INTEGER NOT NULL,
    "status" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL
);
INSERT INTO "new_Anime" ("id", "img", "title") SELECT "id", "img", "title" FROM "Anime";
DROP TABLE "Anime";
ALTER TABLE "new_Anime" RENAME TO "Anime";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
