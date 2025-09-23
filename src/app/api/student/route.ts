import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Lista de alunos" });
}

export async function POST(request: Request) {
    const data = await request.json();
    return NextResponse.json({ message: "Aluno criado", data });
}
