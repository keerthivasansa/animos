/*
  Warnings:

  - Added the required column `img` to the `AnimeInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `AnimeInfo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnimeInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL,
    "genres" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentEp" INTEGER NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_AnimeInfo" ("currentEp", "genres", "id", "malId", "released", "status", "synopsis", "totalEpisodes", "type") SELECT "currentEp", "genres", "id", "malId", "released", "status", "synopsis", "totalEpisodes", "type" FROM "AnimeInfo";
DROP TABLE "AnimeInfo";
ALTER TABLE "new_AnimeInfo" RENAME TO "AnimeInfo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
