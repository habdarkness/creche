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
    if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const data = await request.json();
    const { student, address, documents, housing, assets } = data;
    let id = "id" in student ? student.id : undefined;

    try {
        const result = await prisma.$transaction(async (tx) => {
            let newStudent;

            // Cria ou atualiza o estudante
            if (id == undefined) {
                newStudent = await tx.student.create({ data: student });
                id = newStudent.id;
            } else {
                newStudent = await tx.student.update({
                    where: { id: parseInt(id) },
                    data: student,
                });
            }

            // Função utilitária para limpar valores vazios ("" → null)
            const clean = (obj: any) =>
                Object.fromEntries(
                    Object.entries(obj ?? {}).map(([key, value]) => [
                        key,
                        value === "" ? null : value,
                    ])
                );

            const addressData = clean(address);
            const documentsData = clean(documents);
            const housingData = clean(housing);
            const assetsData = clean(assets);

            // Upserts dentro da transação
            const newAddress = await tx.address.upsert({
                where: { student_id: id },
                create: { ...addressData, student_id: id },
                update: addressData,
            });

            const newDocuments = await tx.documents.upsert({
                where: { student_id: id },
                create: { ...documentsData, student_id: id },
                update: documentsData,
            });

            const newHousing = await tx.housing.upsert({
                where: { student_id: id },
                create: { ...housingData, student_id: id },
                update: housingData,
            });

            const newAssets = await tx.assets.upsert({
                where: { student_id: id },
                create: { ...assetsData, student_id: id },
                update: assetsData,
            });

            return {
                newStudent,
                newAddress,
                newDocuments,
                newHousing,
                newAssets,
            };
        });

        return NextResponse.json({
            message: id ? "Estudante atualizado" : "Estudante criado",
            student: {
                ...result.newStudent,
                address: result.newAddress,
                documents: result.newDocuments,
                housing: result.newHousing,
                assets: result.newAssets,
            },
        });
    } catch (error) {
        console.error("Erro ao salvar Estudante:", error);
        return NextResponse.json(
            { error: "Erro ao salvar Estudante: " + String(error) },
            { status: 500 }
        );
    }
}