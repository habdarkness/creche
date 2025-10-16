// app/api/students/report/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";
import { generateCSV } from "@/lib/csv";

const prisma = new PrismaClient();

export async function GET() {
    const session = await VerifyUser();
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const students = await prisma.student.findMany({ include: { address: true, document: true, housing: true, asset: true } });

    // Gerar CSV usando a lib
    const csv = generateCSV(
        students,
        ["ID", "Nome", "Data de Nascimento", "Idade", "Gênero", "Responsável"],
        s => [
            s.id,
            s.name,
            new Date(s.birthday).toDateString(),
            new Date().getFullYear() - new Date(s.birthday).getFullYear(),
            s.gender,
        ]
    );

    return new NextResponse(csv, {
        status: 200,
        headers: { "Content-Type": "text/csv" }
    });
}
