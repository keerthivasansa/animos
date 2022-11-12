-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EpisodeSrc" (
    "episodeId" INTEGER NOT NULL,
    "animeMalId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceBackup" TEXT NOT NULL,
    "watched" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("animeMalId", "episodeId")
);
INSERT INTO "new_EpisodeSrc" ("animeMalId", "episodeId", "source", "sourceBackup") SELECT "animeMalId", "episodeId", "source", "sourceBackup" FROM "EpisodeSrc";
DROP TABLE "EpisodeSrc";
ALTER TABLE "new_EpisodeSrc" RENAME TO "EpisodeSrc";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
