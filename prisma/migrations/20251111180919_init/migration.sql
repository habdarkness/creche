/*
  Warnings:

  - You are about to drop the column `name` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `school_grade` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `school_year` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Class" DROP COLUMN "name",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "year" TEXT;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "school_grade",
DROP COLUMN "school_year";
