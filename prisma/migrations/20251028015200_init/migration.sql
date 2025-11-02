/*
  Warnings:

  - You are about to drop the column `has_brothers` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "has_brothers",
ADD COLUMN     "has_siblings" BOOLEAN NOT NULL DEFAULT false;
