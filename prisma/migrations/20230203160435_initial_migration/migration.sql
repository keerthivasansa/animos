-- CreateTable
CREATE TABLE "Response" (
    "url" TEXT NOT NULL,
    "response" TEXT NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("url")
);

-- CreateTable
CREATE TABLE "Genre" (
    "malId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("malId")
);

-- CreateTable
CREATE TABLE "SkipTime" (
    "type" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,
    "episodeAnimeKitsuId" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,

    CONSTRAINT "SkipTime_pkey" PRIMARY KEY ("episodeAnimeKitsuId","episodeNumber","type")
);

-- CreateTable
CREATE TABLE "Episode" (
    "title" TEXT NOT NULL,
    "id" INTEGER NOT NULL,
    "animeKitsuId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "watchTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT '',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "length" DOUBLE PRECISION,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("animeKitsuId","number")
);

-- CreateTable
CREATE TABLE "AnimeRelation" (
    "role" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,

    CONSTRAINT "AnimeRelation_pkey" PRIMARY KEY ("sourceId","destinationId")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" INTEGER NOT NULL,
    "accentColor" TEXT,
    "genres" TEXT,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anime" (
    "kitsuId" INTEGER NOT NULL,
    "malId" INTEGER,
    "synopsis" TEXT NOT NULL,
    "ageRating" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT '',
    "title_en" TEXT,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "title_jp" TEXT,
    "zeroEpisode" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "posterImg" TEXT NOT NULL,
    "coverImg" TEXT,
    "genres" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "episodes" INTEGER NOT NULL,
    "slug" TEXT,
    "dubSlug" TEXT,
    "poster" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("kitsuId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_malId_key" ON "Anime"("malId");

-- AddForeignKey
ALTER TABLE "SkipTime" ADD CONSTRAINT "SkipTime_episodeAnimeKitsuId_episodeNumber_fkey" FOREIGN KEY ("episodeAnimeKitsuId", "episodeNumber") REFERENCES "Episode"("animeKitsuId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_animeKitsuId_fkey" FOREIGN KEY ("animeKitsuId") REFERENCES "Anime"("kitsuId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeRelation" ADD CONSTRAINT "AnimeRelation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Anime"("kitsuId") ON DELETE RESTRICT ON UPDATE CASCADE;
