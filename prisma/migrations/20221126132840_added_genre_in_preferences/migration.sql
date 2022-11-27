-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accentColor" TEXT,
    "genres" TEXT
);
INSERT INTO "new_Preferences" ("accentColor", "id") SELECT "accentColor", "id" FROM "Preferences";
DROP TABLE "Preferences";
ALTER TABLE "new_Preferences" RENAME TO "Preferences";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
