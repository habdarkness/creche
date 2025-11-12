import { NextResponse } from "next/server";
import { PrismaClient, Student } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";
import { getAge } from "@/lib/format";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let student;
    if (id) {
        student = await prisma.student.findUnique({
            where: { id: Number(id), ...(session.level > 2 ? { class: { professor_id: session.id } } : {}) },
            include: { address: true, document: true, housing: true, asset: true, reports: true, class: true }
        });
    }
    else {
        student = await prisma.student.findMany({
            ...(session.level > 2 ? { where: { class: { professor_id: session.id } } } : {}),
            include: { address: true, document: true, housing: true, asset: true, reports: true, class: true },
            orderBy: { name: "asc" }
        });
    }

    return NextResponse.json(student);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const data = await request.json();
    const { student, address, document, housing, asset } = data;
    let id = "id" in student ? student.id : undefined;

    try {
        const result = await prisma.$transaction(async (tx) => {
            let newStudent;

            // Cria ou atualiza o estudante
            if (id == undefined) {
                newStudent = await tx.student.create({ data: { ...student, created_by: session.name } });
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

        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: id
                    ? `Atualizou a ficha do Estudante ${result.newStudent.name}`
                    : `Criou a ficha do Estudante ${result.newStudent.name}`
            }
        })
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
export async function DELETE(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }


    const { id } = await request.json();
    try {
        const student = await prisma.student.delete({
            where: { id: parseInt(id) }
        })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: `Deletou o estudante ${student.name} (${getAge(student.birthday)} anos)`
            }
        })
        return NextResponse.json({ message: "Estudante deletado", student });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao deletar estudante: " + String(error) }, { status: 500 }); }
}