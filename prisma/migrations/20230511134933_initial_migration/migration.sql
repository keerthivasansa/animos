-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('FINISHED_AIRING', 'CURRENTLY_AIRING', 'UPCOMING', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SkipType" AS ENUM ('OPENING', 'ENDING');

-- CreateTable
CREATE TABLE "Anime" (
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" VARCHAR(256) NOT NULL,
    "image" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rating" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "episodeCount" INTEGER NOT NULL,
    "genre" TEXT,
    "status" "AnimeStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("malId")
);

-- CreateTable
CREATE TABLE "GenreRecommendation" (
    "malId" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "GenreRecommendation_pkey" PRIMARY KEY ("genre","index")
);

-- CreateTable
CREATE TABLE "TrendingAnime" (
    "index" INTEGER NOT NULL,
    "malId" INTEGER NOT NULL,
    "poster" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "episodes" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,

    CONSTRAINT "TrendingAnime_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "AnimeProvider" (
    "malId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "AnimeProvider_pkey" PRIMARY KEY ("malId","provider")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "animeMalId" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeProvider" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "episodeProviderId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "source" VARCHAR(512),
    "episodeId" TEXT,
    "exactLength" INTEGER,
    "title" TEXT,

    CONSTRAINT "EpisodeProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkipTime" (
    "episodeProviderId" TEXT NOT NULL,
    "type" "SkipType" NOT NULL,
    "start" INTEGER NOT NULL,
    "end" INTEGER NOT NULL,

    CONSTRAINT "SkipTime_pkey" PRIMARY KEY ("episodeProviderId","type")
);

-- CreateTable
CREATE TABLE "EpisodeHistory" (
    "episodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchTime" INTEGER NOT NULL,

    CONSTRAINT "EpisodeHistory_pkey" PRIMARY KEY ("episodeId","userId")
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" TEXT NOT NULL,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_key" (
    "id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,
    "primary_key" BOOLEAN NOT NULL,
    "expires" BIGINT,

    CONSTRAINT "auth_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episode_animeMalId_number_length_key" ON "Episode"("animeMalId", "number", "length");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeProvider_provider_animeId_episodeProviderId_key" ON "EpisodeProvider"("provider", "animeId", "episodeProviderId");

-- CreateIndex
CREATE INDEX "SkipTime_episodeProviderId_idx" ON "SkipTime"("episodeProviderId");

-- CreateIndex
CREATE INDEX "EpisodeHistory_episodeId_idx" ON "EpisodeHistory"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_id_key" ON "auth_user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_id_key" ON "auth_session"("id");

-- CreateIndex
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_key_id_key" ON "auth_key"("id");

-- CreateIndex
CREATE INDEX "auth_key_user_id_idx" ON "auth_key"("user_id");

-- AddForeignKey
ALTER TABLE "GenreRecommendation" ADD CONSTRAINT "GenreRecommendation_malId_fkey" FOREIGN KEY ("malId") REFERENCES "Anime"("malId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_animeMalId_fkey" FOREIGN KEY ("animeMalId") REFERENCES "Anime"("malId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkipTime" ADD CONSTRAINT "SkipTime_episodeProviderId_fkey" FOREIGN KEY ("episodeProviderId") REFERENCES "EpisodeProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeHistory" ADD CONSTRAINT "EpisodeHistory_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_key" ADD CONSTRAINT "auth_key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
