import { z } from "zod";

export class UserForm {
    id = -1;
    name = "";
    email = "";
    token_password = "";
    level = 1;
    send_token = true;

    constructor(data: Partial<UserForm> = {}) {
        Object.assign(this, data);
    }


    getData() {
        return {
            id: this.id == -1 ? undefined : this.id,
            name: this.name,
            email: this.email,
            ...(this.send_token ? {token_password : this.token_password} : {}),
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
    level: z.number().int(),
});


