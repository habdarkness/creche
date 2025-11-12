import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { VerifyUser } from "@/lib/auth";
import { generateToken } from "@/lib/generateToken";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id && parseInt(id) != session.id) { return NextResponse.json({ error: "Não Autorizado" }, { status: 401 }); }

    let users;
    if (id) {
        const user = await prisma.user.findUnique({
            where: { id: Number(id), level: { gt: session.level } },
            include: { actions: true }
        });
        users = user ? [user] : [];
    }
    else {
        users = await prisma.user.findMany({
            where: { level: { gt: session.level } },
            orderBy: { name: "asc" },
            include: { actions: true }
        });
    }

    return NextResponse.json(users);

}

export async function POST(request: Request) {
    const data = await request.json();
    const { id, name, email, phone, password, token_password, level, type } = data;
    const session = await VerifyUser();
    if (!session || (session.level > 2 && id && parseInt(id) != session.id)) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }
    if (level && level <= session.level && id != session.id && session.level > 1) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
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
                    name, phone, email, ...(id != session.id ? { level, type } : {}),
                    ...(
                        password
                            ? { password: hashedPassword }
                            : hashedPassword
                                ? { password: hashedPassword, token_password: hashedPassword }
                                : {}
                    )
                },
                include: { actions: true }
            });
            if (!password) {
                await prisma.action.create({
                    data: {
                        user_id: session.id,
                        user_name: session.name,
                        description: `Atualizou o Usuário ${name} (${type})`
                    }
                })
            }
        }
        else {
            if (!name || !email || !level || !type || !phone) { return NextResponse.json({ error: "Campos inválidos" }, { status: 400 }); }
            const hashedPassword = await bcrypt.hash(generateToken(), 10);
            user = await prisma.user.create({ data: { name, email, phone, level, type, password: hashedPassword, token_password: hashedPassword, created_by: session.name } });
            await prisma.action.create({
                data: {
                    user_id: session.id,
                    user_name: session.name,
                    description: `Criou o Usuário ${name} (${type})`
                }
            })
        };
        return NextResponse.json({ message: id ? "Usuário atualizado" : "Usuário criado", user });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao salvar usuário" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }


    const { id } = await request.json();
    try {
        const user = await prisma.user.delete({
            where: { id: parseInt(id) },
        })
        await prisma.action.create({
            data: {
                user_id: session.id,
                user_name: session.name,
                description: `Deletou o usuário ${user.name} (tipo: ${user.type}, level: ${user.level})`
            }
        })
        return NextResponse.json({ message: "Usuário deletado", user });
    }
    catch (error) { return NextResponse.json({ error: "Erro ao deletar usuário: " + String(error) }, { status: 500 }); }
}