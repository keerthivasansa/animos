/*
  Warnings:

  - The primary key for the `Source` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Source" DROP CONSTRAINT "Source_pkey",
ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("episodeId", "quality", "audio");
