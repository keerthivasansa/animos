/*
  Warnings:

  - Added the required column `index` to the `Poster` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Poster" (
    "created" DATETIME NOT NULL,
    "malId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "score" REAL NOT NULL
);
INSERT INTO "new_Poster" ("created", "img", "malId", "score", "title") SELECT "created", "img", "malId", "score", "title" FROM "Poster";
DROP TABLE "Poster";
ALTER TABLE "new_Poster" RENAME TO "Poster";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
