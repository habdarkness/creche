import { formatCPF, formatPhone, formatRG } from "@/lib/format";
import { Student } from "@prisma/client";
import { z } from "zod";


export class GuardianForm {
    id = -1;
    name = "";
    birthday: Date | null = null;
    rg = "";
    cpf = "";
    kinship = "";
    phone = "";
    workplace = "";
    other_phone = "";

    dad_of: Student[] = []
    mom_of: Student[] = []
    guardian_of: Student[] = []

    constructor(data: Partial<GuardianForm> = {}) {
        data.cpf = formatCPF(data.cpf ?? "");
        data.phone = formatPhone(data.phone ?? "");
        data.other_phone = formatPhone(data.other_phone ?? "");
        data.rg = formatRG(data.rg ?? "");
        Object.assign(this, data);
    }
    getStudents(): Student[] {
        const allStudents = [...this.dad_of, ...this.mom_of, ...this.guardian_of];
        const uniqueMap = new Map<number, Student>();
        allStudents.forEach(student => {
            uniqueMap.set(student.id, student);
        })

        return Array.from(uniqueMap.values());
    }
    getData() {
        return {
            ...(this.id >= 0 ? { id: this.id } : {}),
            name: this.name,
            birthday: this.birthday ? new Date(this.birthday) : null,
            rg: this.rg,
            cpf: this.cpf,
            kinship: this.kinship,
            phone: this.phone,
            workplace: this.workplace,
            other_phone: this.other_phone,
        }
    }
    verify() {
        const result = schema.safeParse(this.getData());
        if (!result.success) {
            return result.error.issues.map(i => i.message).join("<br>");
        }
        return "";
    }
}
const schema = z.object({
    name: z.string("Nome é obrigatório").min(1, "Nome inválido"),
    birthday: z.date("Data de nascimento é obrigatório")
});


