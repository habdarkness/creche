/*
  Warnings:

  - The `gov_aid` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `tv` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dvd` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `radio` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `computer` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notebook` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_fixed` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_mobile` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tablet` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `internet` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cable_tv` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stove` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fridge` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `freezer` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `microwave` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `washing_machine` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `air_conditioner` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bicycle` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `motorcycle` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `car` on table `Assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `septic_tank` on table `Housing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cifon` on table `Housing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `electricity` on table `Housing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `water` on table `Housing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Assets" ALTER COLUMN "tv" SET NOT NULL,
ALTER COLUMN "dvd" SET NOT NULL,
ALTER COLUMN "radio" SET NOT NULL,
ALTER COLUMN "computer" SET NOT NULL,
ALTER COLUMN "notebook" SET NOT NULL,
ALTER COLUMN "phone_fixed" SET NOT NULL,
ALTER COLUMN "phone_mobile" SET NOT NULL,
ALTER COLUMN "tablet" SET NOT NULL,
ALTER COLUMN "internet" SET NOT NULL,
ALTER COLUMN "cable_tv" SET NOT NULL,
ALTER COLUMN "stove" SET NOT NULL,
ALTER COLUMN "fridge" SET NOT NULL,
ALTER COLUMN "freezer" SET NOT NULL,
ALTER COLUMN "microwave" SET NOT NULL,
ALTER COLUMN "washing_machine" SET NOT NULL,
ALTER COLUMN "air_conditioner" SET NOT NULL,
ALTER COLUMN "bicycle" SET NOT NULL,
ALTER COLUMN "motorcycle" SET NOT NULL,
ALTER COLUMN "car" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Housing" ALTER COLUMN "septic_tank" SET NOT NULL,
ALTER COLUMN "septic_tank" SET DEFAULT false,
ALTER COLUMN "cifon" SET NOT NULL,
ALTER COLUMN "cifon" SET DEFAULT false,
ALTER COLUMN "electricity" SET NOT NULL,
ALTER COLUMN "electricity" SET DEFAULT false,
ALTER COLUMN "water" SET NOT NULL,
ALTER COLUMN "water" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "gov_aid",
ADD COLUMN     "gov_aid" BOOLEAN NOT NULL DEFAULT false;
