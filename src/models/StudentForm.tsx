import { z } from "zod";

export class StudentForm {
    id = -1;
    name = "";
    birthday: Date | null = null;
    gender = "M";
    guardian_id = -1;

    constructor(data: Partial<StudentForm> = {}) {
        Object.assign(this, data);
    }


    getData() {
        return {
            ...(this.id != -1 ? { id: this.id } : {}),
            name: this.name,
            birthday: this.birthday,
            gender: this.gender,
            guardian_id: this.guardian_id
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
    birthday: z.date().refine((date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const hasBirthdayPassed =
            today.getMonth() > date.getMonth() ||
            (today.getMonth() === date.getMonth() &&
                today.getDate() >= date.getDate());
        const realAge = hasBirthdayPassed ? age : age - 1;

        return realAge <= 6;
    }, { message: "A criança deve ter no máximo 6 anos" }
    ),
    gender: z.enum(["M", "F"], "Tipo inválido"),
    guardian_id: z.int()
});


