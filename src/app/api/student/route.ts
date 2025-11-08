import { NextResponse } from "next/server";
import { PrismaClient, Student } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

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
    const { student, address, document, housing, asset } = data;
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

            const clean = (obj: any) =>
                Object.fromEntries(
                    Object.entries(obj ?? {}).map(([key, value]) => [
                        key,
                        value === "" ? null : value,
                    ])
                );

            const addressData = clean(address);
            const documentData = clean(document);
            const housingData = clean(housing);
            const assetData = clean(asset);

            // Upserts dentro da transação
            const newAddress = await tx.address.upsert({
                where: { student_id: id },
                create: { ...addressData, student_id: id },
                update: addressData,
            });

            const newDocument = await tx.documents.upsert({
                where: { student_id: id },
                create: { ...documentData, student_id: id },
                update: documentData,
            });
            const newHousing = await tx.housing.upsert({
                where: { student_id: id },
                create: { ...housingData, student_id: id },
                update: housingData,
            });
            const newAsset = await tx.assets.upsert({
                where: { student_id: id },
                create: { ...assetData, student_id: id },
                update: assetData,
            });

            return {
                newStudent,
                newAddress,
                newDocument,
                newHousing,
                newAsset,
            };
        });
        return NextResponse.json({
            message: id ? "Estudante atualizado" : "Estudante criado",
            student: {
                ...result.newStudent,
                address: result.newAddress,
                document: result.newDocument,
                housing: result.newHousing,
                asset: result.newAsset,
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