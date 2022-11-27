-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Episode" (
    "title" TEXT NOT NULL,
    "id" INTEGER NOT NULL,
    "animeKitsuId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "watchTime" REAL NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT '',
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("animeKitsuId", "number")
);
INSERT INTO "new_Episode" ("animeKitsuId", "id", "number", "source", "title", "watchTime") SELECT "animeKitsuId", "id", "number", "source", "title", "watchTime" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
