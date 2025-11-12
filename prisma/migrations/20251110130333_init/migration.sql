/*
  Warnings:

  - You are about to drop the column `file_path` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Report" DROP COLUMN "file_path",
ADD COLUMN     "file" JSONB;
