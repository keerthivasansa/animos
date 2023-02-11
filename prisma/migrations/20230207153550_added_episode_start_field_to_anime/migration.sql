/*
  Warnings:

  - Added the required column `episodeStart` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "episodeStart" INTEGER NOT NULL;
