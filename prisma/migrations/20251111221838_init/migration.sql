-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assets" DROP CONSTRAINT "Assets_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Documents" DROP CONSTRAINT "Documents_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Housing" DROP CONSTRAINT "Housing_student_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documents" ADD CONSTRAINT "Documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Housing" ADD CONSTRAINT "Housing_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assets" ADD CONSTRAINT "Assets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
