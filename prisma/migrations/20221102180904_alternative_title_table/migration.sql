/*
  Warnings:

  - You are about to drop the column `alternativeTitle` on the `Anime` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AlternativeTitle" (
    "keyword" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    PRIMARY KEY ("keyword", "id")
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
