import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StudentForm } from "@/models/StudentForm";
import { cleanObject, getAge } from "@/lib/format";
import { VerifyUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const session = await VerifyUser();
    if (!session || session.level > 2) {
        return NextResponse.json({ error: "Não Autorizado" }, { status: 401 });
    }

    const { ids } = await request.json();

    try {
        const students = await prisma.student.findMany({
            where: { id: { in: ids } },
            include: { housing: true },
        });

        const rows = students.map((s: any) => {
            const clean = cleanObject(s);
            const form = new StudentForm({
                ...clean,
                ...clean.housing,
            });

            return {
                "Nome": form.name,
                "Estado da Matrícula": form.status,
                "Sexo": form.gender,
                "Cor": form.color,
                "Data de nacimento": form.birthday?.toLocaleString("PT-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
                "Idade": getAge(form.birthday),
                "Faixa Etária": form.getAgeGroup(),

                "Grade": form.class?.grade,
                "Ano": form.class?.year,

                "Problemas de Saúde": form.health_issues,
                "Restrição Alimentar": form.food_restriction,
                "Alergia": form.food_restriction,
                "Deficiência": form.allergy,
                "Mobilidade Reduzida": form.mobility,
                "Possui Deficiências Múltiplas": form.disabilities,
                "Criança Público Alvo de Educação Especial": form.special_needs,
                "Classificação": form.classification,

                "O Responsável é Beneficiário do Governo": form.gov_aid ? "Sim" : "Não",
                "Número do NIS": form.nis_number,

                "Renda familiar total": form.getTotal(),
                "Renda per Capita": form.getPerCapta(),

                "Município": form.city,
                "UF": form.state,
                "CEP": form.cep,

                "Moradia": form.type,
                "Aluguel": form.rent_value,
                "Nº de Comodos": form.rooms,
                "Tipo de Piso": form.floor_type,
                "Tipo de Moradia": form.building_type,
                "Tipo de Cobertura": form.roof_type,

                "Fossa": form.septic_tank ? "Sim" : "Não",
                "Cifon": form.cifon ? "Sim" : "Não",
                "Energia": form.electricity ? "Sim" : "Não",
                "Água Encanada": form.water ? "Sim" : "Não",

                "TV": form.tv ? "Sim" : "Não",
                "DVD": form.dvd ? "Sim" : "Não",
                "Rádio": form.radio ? "Sim" : "Não",
                "Computador": form.computer ? "Sim" : "Não",
                "Notebook": form.notebook ? "Sim" : "Não",
                "Telefone Fixo": form.phone_fixed ? "Sim" : "Não",
                "Telefone Celular": form.phone_mobile ? "Sim" : "Não",
                "Tablet": form.tablet ? "Sim" : "Não",
                "Internet": form.internet ? "Sim" : "Não",
                "TV a cabo": form.cable_tv ? "Sim" : "Não",
                "Fogão": form.stove ? "Sim" : "Não",
                "Geladeira": form.fridge ? "Sim" : "Não",
                "Freezer": form.freezer ? "Sim" : "Não",
                "Micro-ondas": form.microwave ? "Sim" : "Não",
                "Máquina de lavar": form.washing_machine ? "Sim" : "Não",
                "Ar Condicionado": form.air_conditioner ? "Sim" : "Não",
                "Bicicleta": form.bicycle ? "Sim" : "Não",
                "Moto": form.motorcycle ? "Sim" : "Não",
                "Carro": form.car ? "Sim" : "Não",
            };
        });

        const headers = Object.keys(rows[0]).join(";");
        const lines = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(";"));
        const csv = [headers, ...lines].join("\n");
        const csvWithBom = "\uFEFF" + csv;

        return new NextResponse(csvWithBom, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition":
                    "attachment; filename=relatorio_demografico.csv",
            },
        });
    }
    catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao gerar CSV" },
            { status: 500 }
        );
    }
}
