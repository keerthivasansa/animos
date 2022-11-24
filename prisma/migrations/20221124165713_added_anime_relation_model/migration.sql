-- CreateTable
CREATE TABLE "AnimeRelation" (
    "role" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,

    PRIMARY KEY ("sourceId", "destinationId"),
    CONSTRAINT "AnimeRelation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Anime" ("kitsuId") ON DELETE RESTRICT ON UPDATE CASCADE
);
