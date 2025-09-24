import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const guardian = searchParams.get("guardian");

    let users;
    if (id) {
        users = await prisma.user.findUnique({
            where: { id: Number(id) }
        });
    }
    else {
        users = await prisma.user.findMany({
            where: { level: { gte: session.level }, ...(guardian ? { guardian: true } : {}) }
        });
    }

    return NextResponse.json(users);
}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

    const data = await request.json();
    const { id, name, email, password, token_password, level, type, guardian } = data;
    if (level && level <= session.level && session.id != id) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
    try {
        let user;
        if (id) {
            const id_int = parseInt(id);
            if (isNaN(id_int)) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            const hashedPassword = password
                ? await bcrypt.hash(password, 10)
                : token_password
                    ? await bcrypt.hash(token_password, 10)
                    : undefined;

            user = await prisma.user.update({
                where: { id: id_int },
                data: {
                    name, email, level, type, guardian,
                    ...(
                        password
                            ? { password: hashedPassword }
                            : hashedPassword
                                ? { password: hashedPassword, token_password: hashedPassword }
                                : {}
                    )
                }
            });
        }
        else {
            if (!name || !email || !level || !token_password || !type || guardian == undefined) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            const hashedPassword = await bcrypt.hash(token_password, 10);
            user = await prisma.user.create({ data: { name, email, level, type, guardian, password: hashedPassword, token_password: hashedPassword } });
        };
        return NextResponse.json({ message: id ? "Usuário atualizado" : "Usuário criado", user, });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar usuário" }, { status: 500 }); }
}