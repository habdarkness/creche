import { z } from "zod";
export const userTypes: Record<string, number> = {
    "Administrador": 1,
    "Secretário": 1,
    "Professor": 2,
    "Psicologos": 2,
}
export class UserForm {
    id = -1;
    name = "";
    email = "";
    phone = "";
    token_password = "";
    type = "Usuário";
    send_token = true;

    constructor(data: Partial<UserForm> = {}) {
        Object.assign(this, data);
    }


    getData() {
        return {
            id: this.id == -1 ? undefined : this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            ...(this.send_token ? { token_password: this.token_password } : {}),
            type: this.type,
            level: this.type in userTypes ? userTypes[this.type] : undefined
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
    type: z.enum(Object.keys(userTypes), "Tipo inválido"),
    guardian: z.boolean(),
});


