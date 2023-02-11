/*
  Warnings:

  - A unique constraint covering the columns `[animePaheId]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `animePaheId` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "animePaheId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Episode_animePaheId_key" ON "Episode"("animePaheId");
