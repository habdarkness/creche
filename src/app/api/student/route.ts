import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let student;
    if (id) { student = await prisma.student.findUnique({ where: { id: Number(id) }, include: { parent: true } }); }
    else { student = await prisma.student.findMany({ include: { parent: true } }); }

    return NextResponse.json(student);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const data = await request.json();
    const { id, name, guardian_id, birthday, gender } = data;
    try {
        let student;
        if (id) {
            const id_int = parseInt(id);
            if (isNaN(id_int)) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            student = await prisma.student.update({
                where: { id: id_int },
                data: { name, guardian_id, birthday, gender },
                include: { parent: true }
            });
        }
        else {
            if (!name || !guardian_id || !birthday || !gender) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            student = await prisma.student.create({ data: { name, guardian_id, birthday, gender }, include: { parent: true } });
        };
        return NextResponse.json({ message: id ? "Estudante atualizado" : "Estudante criado", student });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante" }, { status: 500 }); }
}