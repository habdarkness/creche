import { Action, Address, Assets, Class, Documents, Guardian, Housing, Student, User } from "@prisma/client";

export type UserWithRelations = User & {
    actions: Action[]
}
export type StudentWithRelations = Student & {
    documents: Documents;
    address: Address;
    housing: Housing;
    assets: Assets;
    classes: Class | null;
    mom: Guardian | null;
    dad: Guardian | null;
    guardian: Guardian | null;
}
export type GuardianWithRelations = Guardian & {
    dad_of: Student[];
    mom_of: Student[];
    guardian_of: Student[];
}
export type ActionWithRelations = Action & {
    user: User
}
export type ClassWithRelations = Class & {
    professor: User;
    students: Student;
}