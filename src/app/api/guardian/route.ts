import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let guardian;
    if (id) {
        guardian = await prisma.guardian.findUnique({
            where: { id: parseInt(id) },
            include: { dad_of: true, mom_of: true, guardian_of: true }
        });
    }
    else {
        guardian = await prisma.guardian.findMany({
            include: { dad_of: true, mom_of: true, guardian_of: true },
            orderBy: { name: "asc" }
        });
    }

    return NextResponse.json(guardian);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const data = await request.json();
    const { id, name, birthday, rg, cpf, kinship, phone, workplace, other_phone } = data;
    try {
        const guardian = {
            name, birthday, rg, cpf, kinship, phone, workplace, other_phone,
        }
        const newGuardian = await prisma.guardian.upsert({
            where: { id: id != undefined ? parseInt(id) : -1 },
            create: { ...guardian, created_by: session.name },
            update: guardian,
        });
        await prisma.action.create({
            data: {
                user_id: session.id,
                description: id
                    ? `Atualizou a ficha do responsável ${newGuardian.name}(${newGuardian.kinship})`
                    : `Criou a ficha do responsável ${newGuardian.name}(${newGuardian.kinship})`
            }
        })
        return NextResponse.json({ message: id ? "Responsável atualizado" : "Responsável criado", guardian: newGuardian });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }


    const { id } = await request.json();
    try {
        const guardian = await prisma.guardian.delete({
            where: { id: parseInt(id) },
        })
        await prisma.action.create({
            data: {
                user_id: session.id,
                description: `Deletou o responsável ${guardian.name} (${guardian.kinship})`
            }
        })
        return NextResponse.json({ message: "Responsável deletado", guardian });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao deletar responsável: " + String(error) }, { status: 500 }); }
}