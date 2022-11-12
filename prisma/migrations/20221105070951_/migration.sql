/*
  Warnings:

  - You are about to drop the `EpisodeSrc` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Episode" ADD COLUMN "source" TEXT;
ALTER TABLE "Episode" ADD COLUMN "sourceBackup" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EpisodeSrc";
PRAGMA foreign_keys=on;
