import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { VerifyUser } from "@/lib/auth";
import { generateToken } from "@/lib/generateToken";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (session.level > 1 && id != session.id) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }

    let users;
    if (id) {
        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        users = user ? [user] : [];
    } else {
        users = await prisma.user.findMany({
            where: { level: { gte: session.level } },
            orderBy: { name: "asc" }
        });
    }

    return NextResponse.json(users);

}

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session) { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
    const data = await request.json();
    const { id, name, email, phone, password, token_password, level, type } = data;
    if (session.level > 1 && id != session.id) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }
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
                    name, phone, email, level, type,
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
            if (!name || !email || !level || !type || !phone) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            const hashedPassword = await bcrypt.hash(generateToken(), 10);
            user = await prisma.user.create({ data: { name, email, phone, level, type, password: hashedPassword, token_password: hashedPassword } });
        };
        return NextResponse.json({ message: id ? "Usuário atualizado" : "Usuário criado", user, });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar usuário" }, { status: 500 }); }
}