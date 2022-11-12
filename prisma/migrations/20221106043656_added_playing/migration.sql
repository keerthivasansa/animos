-- CreateTable
CREATE TABLE "Playing" (
    "animeMalId" INTEGER NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "watch" INTEGER NOT NULL,
    "lastWatched" DATETIME NOT NULL,

    PRIMARY KEY ("animeMalId", "episodeId")
);
