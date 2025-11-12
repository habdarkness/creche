import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }
    const classes = await prisma.class.findMany({
        where: { ...(session.level > 2 ? { professor_id: session.id } : {}) },
    });
    return NextResponse.json(classes);
}
export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 1) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const data = await request.json();
    data["created_by"] = session.name;
    try {
        const students_class = await prisma.class.upsert({
            where: { id: data.id != undefined ? parseInt(data.id) : -1 },
            create: data,
            update: data,
            include: { professor: true, students: true }
        })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: data.id
                    ? `Atualizou a turma ${students_class.grade} ${students_class.year}`
                    : `Criou a turma ${students_class.grade} ${students_class.year}`
            }
        })
        return NextResponse.json({ message: data.id ? "Turma atualizada" : "Turma criada", students_class });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar relatório: " + String(error) }, { status: 500 }); }
}
export async function DELETE(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }


    const { id } = await request.json();
    try {
        const students_class = await prisma.class.delete({
            where: { id: parseInt(id) }
        })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: `Deletou a turma (grade: ${students_class.grade} ano: ${students_class.year})`
            }
        })
        return NextResponse.json({ message: "Turma deletada", students_class });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao deletar turma: " + String(error) }, { status: 500 }); }
}