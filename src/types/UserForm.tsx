import { z } from "zod";

export class UserForm {
    id = -1;
    name = "";
    email = "";
    password = "";
    level = 1;

    constructor(data: Partial<UserForm> = {}) {
        for (const key in data) {
            const value = data[key as keyof UserForm];
            if (value !== null && value !== undefined) {
                (this as any)[key] = value;
            }
        }
    }
    getData() {
        return {
            id: this.id == -1 ? undefined : this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            level: this.level
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
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    level: z.number().int()
});


