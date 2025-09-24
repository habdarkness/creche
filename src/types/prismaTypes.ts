import { Student, User } from "@prisma/client";

export type StudentWithRelations = Student & { guardian: User }