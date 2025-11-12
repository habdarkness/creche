import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }) }

    const reports = await prisma.report.findMany({
        where: { student_id: Number(id), ...(session.level > 2 ? { professor_id: session.id } : {}) },
        orderBy: { date: "desc" }
    });
    return NextResponse.json(reports);
}
export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const data = await request.json();
    data["professor_id"] = session.id;
    try {
        data["date"] = new Date(data["date"]);
        const report = await prisma.report.upsert({
            where: { id: data.id != undefined ? parseInt(data.id) : -1 },
            create: data,
            update: data,
            include: { student: true }
        })
        const day = report.date.toLocaleString("PT-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: data.id
                    ? `Atualizou o relatório do dia ${day} sobre o estudante ${report.student?.name}`
                    : `Criou o relatório do dia ${day} sobre o estudante ${report.student?.name}`
            }
        })
        return NextResponse.json({ message: data.id ? "Relatório atualizado" : "Relatório criado", report });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar relatório: " + String(error) }, { status: 500 }); }
}
export async function DELETE(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const { id, student_id } = await request.json();
    try {
        const report = await prisma.report.delete({
            where: { id: parseInt(id), student_id: parseInt(student_id), professor_id: session.id },
            include: { student: true }
        })
        const day = report.date.toLocaleString("PT-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: `Deletou o relatório do dia ${day} sobre o estudante ${report.student?.name}`
            }
        })
        return NextResponse.json({ message: "Relatório deletado", report });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao deletar relatório: " + String(error) }, { status: 500 }); }
}