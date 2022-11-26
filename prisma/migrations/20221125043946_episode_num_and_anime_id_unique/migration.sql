/*
  Warnings:

  - A unique constraint covering the columns `[animeKitsuId,number]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Episode_animeKitsuId_number_key" ON "Episode"("animeKitsuId", "number");
