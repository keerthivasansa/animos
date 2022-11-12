/*
  Warnings:

  - You are about to alter the column `score` on the `Anime` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anime" (
    "animeId" TEXT,
    "malId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "englishTitle" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL,
    "synopsis" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentEp" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL
);
INSERT INTO "new_Anime" ("animeId", "currentEp", "englishTitle", "img", "malId", "score", "status", "synopsis", "title", "totalEpisodes", "type") SELECT "animeId", "currentEp", "englishTitle", "img", "malId", "score", "status", "synopsis", "title", "totalEpisodes", "type" FROM "Anime";
DROP TABLE "Anime";
ALTER TABLE "new_Anime" RENAME TO "Anime";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
