import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
    if (session.level > 2) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let guardian;
    if (id) { guardian = await prisma.guardian.findUnique({ where: { id: Number(id) }, include: { dad_of: true, mom_of: true, guardian_of: true } }); }
    else { guardian = await prisma.guardian.findMany({ include: { dad_of: true, mom_of: true, guardian_of: true } }); }

    return NextResponse.json(guardian);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
    if (session.level > 2) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }

    const data = await request.json();
    const { id, name, birthday, rg, cpf, kinship, phone, workplace, other_phone } = data;
    try {
        const guardian = {
            name, birthday, rg, cpf, kinship, phone, workplace, other_phone,
        }
        const newGuardian = await prisma.guardian.upsert({
            where: { id: id != undefined ? parseInt(id) : -1 },
            create: guardian,
            update: guardian,
        });
        return NextResponse.json({ message: id ? "Responsável atualizado" : "Responsável criado", guardian: newGuardian });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante" }, { status: 500 }); }
}