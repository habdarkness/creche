import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";
import { VerifyUser } from "@/lib/auth";
import { StudentWithRelations } from "@/types/prismaTypes";
import { PrismaClient } from "@prisma/client";
import { StudentForm } from "@/models/StudentForm";
import { cleanObject } from "@/lib/format";
import expressions from "docxtemplater/expressions.js";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    try {
        const { id } = await request.json();
        let student;
        if (id) {
            student = await prisma.student.findUnique({
                where: { id: Number(id) }, include: {
                    dad: true, mom: true, guardian: true, class: true,
                    address: true, document: true, housing: true, asset: true
                }
            });
        }

        const data = format(student as StudentWithRelations | null);
        console.log(data);
        const templatePath = path.join(process.cwd(), "public", "student_model.docx");
        const content = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => "", parser: expressions, });

        doc.render(data);
        const buffer = doc.getZip().generate({ type: "nodebuffer" });
        const uint8Array = new Uint8Array(buffer);
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename=Ficha_${"Aluno"}.docx`,
            },
        });
    }
    catch (error: any) {
        console.log(error)
        return NextResponse.json({ error: "Erro ao gerar documento" }, { status: 500 });
    }
}
function format(student: StudentWithRelations | null) {
    if (student) {
        const clean = cleanObject(student)
        const form = new StudentForm({
            ...clean.address,
            ...clean.housing,
            ...clean.asset,
            ...clean.document,
            dad: clean.dad,
            mom: clean.mom,
            guardian: clean.guardian,
            ...clean,
        })
        return form.getDocxData();
    }
    return {};
}