/*
  Warnings:

  - Added the required column `description` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "title" TEXT NOT NULL,
    "id" INTEGER NOT NULL,
    "animeKitsuId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "watchTime" REAL NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT '',

    PRIMARY KEY ("animeKitsuId", "number")
);
INSERT INTO "new_Episode" ("animeKitsuId", "id", "number", "source", "title", "watchTime") SELECT "animeKitsuId", "id", "number", "source", "title", "watchTime" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
