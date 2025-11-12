import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 1) { return NextResponse.json({ error: "Não autorizado" }, { status: 401 }); }

    const actions = await prisma.action.findMany({ orderBy: { created_at: "desc" }, include: { user: true } });
    return NextResponse.json(actions);
}