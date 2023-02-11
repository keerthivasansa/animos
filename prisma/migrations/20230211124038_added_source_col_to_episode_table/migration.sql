/*
  Warnings:

  - Added the required column `lastUpdated` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "sourceTaken" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL;
