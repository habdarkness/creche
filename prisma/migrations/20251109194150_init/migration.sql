-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token_password" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guardian" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "kinship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "workplace" TEXT NOT NULL,
    "other_phone" TEXT NOT NULL,
    "created_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "twins" BOOLEAN NOT NULL DEFAULT false,
    "has_siblings" BOOLEAN NOT NULL DEFAULT false,
    "school_year" TEXT,
    "school_grade" TEXT,
    "class_id" INTEGER,
    "sus" JSONB NOT NULL,
    "health_issues" TEXT,
    "food_restriction" TEXT,
    "allergy" TEXT,
    "mobility" TEXT,
    "disabilities" JSONB,
    "special_needs" TEXT,
    "classification" TEXT,
    "dad_id" INTEGER,
    "mom_id" INTEGER,
    "guardian_id" INTEGER,
    "family" JSONB,
    "authorized" JSONB,
    "gov_aid" TEXT,
    "nis_number" TEXT,
    "created_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "reference" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "cep" TEXT,
    "phone_home" TEXT,
    "phone_alt" TEXT,
    "student_id" INTEGER,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Documents" (
    "id" SERIAL NOT NULL,
    "birth_cert" TEXT,
    "registry_city" TEXT,
    "birth_city" TEXT,
    "registry_office" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "rg_issue_date" TIMESTAMP(3),
    "rg_issuer" TEXT,
    "student_id" INTEGER,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Housing" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "rent_value" DOUBLE PRECISION,
    "rooms" INTEGER,
    "floor_type" TEXT,
    "building_type" TEXT,
    "roof_type" TEXT,
    "septic_tank" BOOLEAN,
    "cifon" BOOLEAN,
    "electricity" BOOLEAN,
    "water" BOOLEAN,
    "student_id" INTEGER,

    CONSTRAINT "Housing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assets" (
    "id" SERIAL NOT NULL,
    "tv" BOOLEAN DEFAULT false,
    "dvd" BOOLEAN DEFAULT false,
    "radio" BOOLEAN DEFAULT false,
    "computer" BOOLEAN DEFAULT false,
    "notebook" BOOLEAN DEFAULT false,
    "phone_fixed" BOOLEAN DEFAULT false,
    "phone_mobile" BOOLEAN DEFAULT false,
    "tablet" BOOLEAN DEFAULT false,
    "internet" BOOLEAN DEFAULT false,
    "cable_tv" BOOLEAN DEFAULT false,
    "stove" BOOLEAN DEFAULT false,
    "fridge" BOOLEAN DEFAULT false,
    "freezer" BOOLEAN DEFAULT false,
    "microwave" BOOLEAN DEFAULT false,
    "washing_machine" BOOLEAN DEFAULT false,
    "air_conditioner" BOOLEAN DEFAULT false,
    "bicycle" BOOLEAN DEFAULT false,
    "motorcycle" BOOLEAN DEFAULT false,
    "car" BOOLEAN DEFAULT false,
    "student_id" INTEGER,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "professor_id" INTEGER,
    "created_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "file_path" JSONB,
    "professor_id" INTEGER,
    "student_id" INTEGER,
    "created_by" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Action" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_cpf_key" ON "public"."Guardian"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_rg_key" ON "public"."Guardian"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "Address_student_id_key" ON "public"."Address"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_student_id_key" ON "public"."Documents"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Housing_student_id_key" ON "public"."Housing"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Assets_student_id_key" ON "public"."Assets"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Class_professor_id_key" ON "public"."Class"("professor_id");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_dad_id_fkey" FOREIGN KEY ("dad_id") REFERENCES "public"."Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_mom_id_fkey" FOREIGN KEY ("mom_id") REFERENCES "public"."Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "public"."Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documents" ADD CONSTRAINT "Documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Housing" ADD CONSTRAINT "Housing_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assets" ADD CONSTRAINT "Assets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Action" ADD CONSTRAINT "Action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
