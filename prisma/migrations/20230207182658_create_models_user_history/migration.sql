/*
  Warnings:

  - You are about to drop the column `watchTime` on the `Episode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[animePaheNum,animeKitsuId]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "watchTime";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accentColor" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "episodeNumber" INTEGER NOT NULL,
    "animeKitsuId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "watchTime" INTEGER NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("episodeNumber","animeKitsuId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Episode_animePaheNum_animeKitsuId_key" ON "Episode"("animePaheNum", "animeKitsuId");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
