-- CreateTable
CREATE TABLE "Anime" (
    "kitsuId" TEXT NOT NULL,
    "malId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "synopsis" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_jp" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "posterImg" TEXT NOT NULL,
    "coverImg" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "episodes" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "dubSlug" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_kitsuId_key" ON "Anime"("kitsuId");
