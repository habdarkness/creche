import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StudentForm } from "@/models/StudentForm";
import { cleanObject } from "@/lib/format";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
    if (session.level > 2) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }

    const students = await prisma.student.findMany({ include: { housing: true } });

    // monta lista final
    const rows = students.map(s => {
        const clean = cleanObject(s)
        const form = new StudentForm({
            ...clean,
            ...clean.housing,
        })

        return {
            "Matricula": form.status,
            "Nome": form.name,
            "Sexo": form.gender,
            "Cor": form.color,
            "Idade": form.getAge(),
            "Faixa Etária": form.getAgeGroup(),
            "Renda per Capita": form.getPerCapta(),
            "Moradia": s.housing?.type ?? "",
            "Aluguel": s.housing?.rent_value ?? "",
            "Água": form.water ? "Sim" : "Não",
            "Energia": form.electricity ? "Sim" : "Não",
            "Deficiência": form.classification
        };
    });

    // gera CSV manualmente
    const headers = Object.keys(rows[0]).join(";");
    const lines = rows.map(r =>
        Object.values(r).map(v => `"${v}"`).join(";")
    );
    const csv = [headers, ...lines].join("\n");

    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=relatorio_demografico.csv",
        }
    });
}