/*
  Warnings:

  - You are about to drop the column `source` on the `Episode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "source";

-- CreateTable
CREATE TABLE "Source" (
    "episodeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audio" VARCHAR(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("episodeId")
);

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("animePaheId") ON DELETE RESTRICT ON UPDATE CASCADE;
