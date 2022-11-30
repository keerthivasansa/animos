/*
  Warnings:

  - Made the column `episodes` on table `Anime` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anime" (
    "kitsuId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "malId" INTEGER,
    "synopsis" TEXT NOT NULL,
    "ageRating" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT '',
    "title_en" TEXT,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "title_jp" TEXT,
    "zeroEpisode" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "posterImg" TEXT NOT NULL,
    "coverImg" TEXT,
    "genres" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "episodes" INTEGER NOT NULL,
    "slug" TEXT,
    "dubSlug" TEXT,
    "poster" INTEGER,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Anime" ("ageRating", "available", "coverImg", "dubSlug", "episodes", "genres", "kitsuId", "lastUpdated", "liked", "malId", "poster", "posterImg", "score", "slug", "synopsis", "title", "title_en", "title_jp", "type", "zeroEpisode") SELECT "ageRating", "available", "coverImg", "dubSlug", "episodes", "genres", "kitsuId", "lastUpdated", "liked", "malId", "poster", "posterImg", "score", "slug", "synopsis", "title", "title_en", "title_jp", "type", "zeroEpisode" FROM "Anime";
DROP TABLE "Anime";
ALTER TABLE "new_Anime" RENAME TO "Anime";
CREATE UNIQUE INDEX "Anime_malId_key" ON "Anime"("malId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
