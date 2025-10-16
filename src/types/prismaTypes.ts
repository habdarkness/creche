import { Address, Assets, Documents, Guardian, Housing, Student } from "@prisma/client";

export type StudentWithRelations = Student & {
    documents: Documents;
    address: Address;
    housing: Housing;
    assets: Assets;
}
export type GuardianWithRelations = Guardian & {
    dad_of: Student[];
    mom_of: Student[];
    guardian_of: Student[];
}