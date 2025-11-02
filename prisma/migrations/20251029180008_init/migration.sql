/*
  Warnings:

  - You are about to drop the column `sewer` on the `Housing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Housing" DROP COLUMN "sewer",
ADD COLUMN     "cifon" BOOLEAN;
