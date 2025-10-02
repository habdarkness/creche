import { z } from "zod";

export class GuardianForm {
    id = -1;
    name = "";
    email = "";
    phone = ""

    constructor(data: Partial<GuardianForm> = {}) {
        Object.assign(this, data);
    }


    getData() {
        return {
            ...(this.id != -1 ? { id: this.id } : {}),
            name: this.name,
            email: this.email,
            phone: this.phone,
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


