import { cleanObject } from "@/lib/format";
import { Guardian } from "@prisma/client";
import { z } from "zod";

export class GuardianForm {
    id = -1;
    name = "";
    cpf = "";
    rg = "";
    email = "";
    phone = ""
    work_place = "";

    constructor(data: Partial<GuardianForm | Guardian> = {}) {
        Object.assign(this, cleanObject(data));
    }



    getData() {
        return {
            ...(this.id != -1 ? { id: this.id } : {}),
            name: this.name,
            cpf: this.cpf,
            rg: this.rg,
            email: this.email,
            phone: this.phone,
            work_place: this.work_place
        }
    }
    verify() {
        const result = loginSchema.safeParse(this.getData());
        if (!result.success) {
            return result.error.issues.map(e => e.message).join("\n");
        }
        return "";
    }
}
const loginSchema = z.object({
    name: z.string().min(1, "Nome inválido"),
    email: z.email("Email inválido"),
    phone: z.string().min(8, "Telefone inválido"),
});


