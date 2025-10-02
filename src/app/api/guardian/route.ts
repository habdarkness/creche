import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let guardian;
    if (id) { guardian = await prisma.guardian.findUnique({ where: { id: Number(id) }, include: { students: true } }); }
    else { guardian = await prisma.guardian.findMany({ include: { students: true } }); }

    return NextResponse.json(guardian);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const data = await request.json();
    const { id, name, email, phone } = data;
    try {
        let guardian;
        if (id) {
            const id_int = parseInt(id);
            if (isNaN(id_int)) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            guardian = await prisma.guardian.update({
                where: { id: id_int },
                data: { name, email, phone },
            });
        }
        else {
            if (!name || !email || !phone) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            guardian = await prisma.guardian.create({ data: { name, email, phone } });
        };
        return NextResponse.json({ message: id ? "Responsável atualizado" : "Responsável criado", guardian });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar Estudante" }, { status: 500 }); }
}