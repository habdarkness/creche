import { z } from "zod";
export const userTypes: Record<string, number> = {
    "Administrador": 1,
    "Professor": 2,
    "Psicologos": 2,
    "Usuário": 3
}
export class UserForm {
    id = -1;
    name = "";
    email = "";
    token_password = "";
    type = "Usuário";
    guardian = true;
    send_token = true;

    constructor(data: Partial<UserForm> = {}) {
        Object.assign(this, data);
    }


    getData() {
        return {
            id: this.id == -1 ? undefined : this.id,
            name: this.name,
            email: this.email,
            ...(this.send_token ? { token_password: this.token_password } : {}),
            type: this.type,
            guardian: this.guardian,
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
    type: z.enum(Object.keys(userTypes), "Tipo inválido"),
    guardian: z.boolean(),
});


