/*
  Warnings:

  - You are about to drop the column `id` on the `Episode` table. All the data in the column will be lost.
  - Added the required column `animePaheNum` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Episode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "id",
ADD COLUMN     "animePaheNum" INTEGER NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL;
