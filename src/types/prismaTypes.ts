import { Guardian, Student } from "@prisma/client";

export type StudentWithRelations = Student & { guardian: Guardian }
export type GuadianWithRelations = Guardian & { students: Student[] }