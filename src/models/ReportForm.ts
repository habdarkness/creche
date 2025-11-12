import { parseID } from "@/lib/format";
import z from "zod";

export class ReportForm {
    id = -1;
    title = "";
    description = "";
    date = new Date();
    file_path = "";
    file: Record<string, string> = { base64: "", name: "" };
    student_id = -1;

    constructor(data: Partial<ReportForm> = {}) {
        if (typeof data.date == "string") { data.date = new Date(data.date) }
        Object.assign(this, data);
    }
    getData() {
        return {
            ...parseID("id", this.id),
            title: this.title,
            description: this.description,
            date: this.date,
            file: this.file,
            ...parseID("student_id", this.student_id)
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
    title: z.string().min(1, "Título é obrigatório"),
    date: z.date("Data é obrigatório").max(new Date(), "A data não pode ser no futuro"),
});
