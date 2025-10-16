import { NextResponse } from "next/server";
import { PrismaClient, Student } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";
import { StudentWithRelations } from "@/types/prismaTypes";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let student;
    if (id) { student = await prisma.student.findUnique({ where: { id: Number(id) }, include: { address: true, document: true, housing: true, asset: true } }); }
    else { student = await prisma.student.findMany({ include: { address: true, document: true, housing: true, asset: true } }); }

    return NextResponse.json(student);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const data = await request.json();
    const { student, address, documents, housing, assets } = data;
    try {
        let id = "id" in student ? student.id : undefined;
        if (id != undefined && isNaN(id)) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
        let newStudent: Student
        if (id == undefined) {
            newStudent = await prisma.student.create({
                data: student,
            });
        }
        else {
            newStudent = await prisma.student.update({
                where: { id: parseInt(id) },
                data: student,
            });
        }
        id = newStudent.id;
        const newAddress = await prisma.address.upsert({
            where: { student_id: id },
            create: address,
            update: address
        });
        const newDocuments = await prisma.documents.upsert({
            where: { student_id: id },
            create: documents,
            update: documents
        });
        const newHousing = await prisma.housing.upsert({
            where: { student_id: id },
            create: housing,
            update: housing
        });
        const newAssets = await prisma.assets.upsert({
            where: { student_id: id },
            create: assets,
            update: assets
        });
        const studentWithRelationships = { ...newStudent, address: newAddress, documents: newDocuments, housing: newHousing, assets: newAssets }
        return NextResponse.json({ message: id ? "Estudante atualizado" : "Estudante criado", student: studentWithRelationships });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante: " + String(error) }, { status: 500 }); }
}