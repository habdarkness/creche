import { parseID } from "@/lib/format";
import z from "zod";

export class ClassForm {
    id = -1;
    grade = "";
    year = "";
    professor_id = -1;

    constructor(data: Partial<ClassForm> = {}) {
        data["professor_id"] = Number(data["professor_id"]);
        Object.assign(this, data);
    }
    getData() {
        return {
            ...parseID("id", this.id),
            grade: this.grade,
            year: this.year,
            ...parseID("professor_id", this.professor_id),
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
});
