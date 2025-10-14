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
    if (id) { student = await prisma.student.findUnique({ where: { id: Number(id) }, include: { guardians: true } }); }
    else { student = await prisma.student.findMany({ include: { guardians: true } }); }

    return NextResponse.json(student);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const data = await request.json();
    const { student, address, documents, housing, assets } = data;
    try {
        const id = "id" in student ? student.id : undefined;
        if (id != undefined && isNaN(id)) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
        await prisma.address.upsert({
            where: { student_id: id },
            create: address,
            update: documents
        });
        await prisma.documents.upsert({
            where: { student_id: id },
            create: documents,
            update: documents
        });
        await prisma.housing.upsert({
            where: { student_id: id },
            create: housing,
            update: housing
        });
        await prisma.assets.upsert({
            where: { student_id: id },
            create: assets,
            update: assets
        });
        const newStudent = await prisma.student.upsert({
            where: { id: id },
            create: assets,
            update: assets,
            include: { address: true, housing: true, document: true, asset: true, guardians: true }
        });
        return NextResponse.json({ message: id ? "Estudante atualizado" : "Estudante criado", newStudent });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante" }, { status: 500 }); }
}