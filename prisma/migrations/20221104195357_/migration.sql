/*
  Warnings:

  - You are about to drop the `AnimeInfo` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Anime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Anime` table. All the data in the column will be lost.
  - Added the required column `currentEp` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishTitle` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `malId` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `synopsis` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalEpisodes` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AnimeInfo";
PRAGMA foreign_keys=on;

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
    "score" INTEGER NOT NULL
);
INSERT INTO "new_Anime" ("img", "title") SELECT "img", "title" FROM "Anime";
DROP TABLE "Anime";
ALTER TABLE "new_Anime" RENAME TO "Anime";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
