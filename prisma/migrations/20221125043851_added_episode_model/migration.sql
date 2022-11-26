-- CreateTable
CREATE TABLE "SkipTime" (
    "type" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,

    PRIMARY KEY ("episodeId", "type"),
    CONSTRAINT "SkipTime_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episode" (
    "title" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animeKitsuId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT ''
);
