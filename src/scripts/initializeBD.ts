import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("123456", 10);
    // === Usuários (professores) ===
    const user1 = await prisma.user.create({
        data: {
            name: "Alice Silva",
            email: "alice@email.com",
            phone: "11999990001",
            password: passwordHash,
            token_password: passwordHash,
            type: "teacher",
            level: 2,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Bruno Souza",
            email: "bruno@email.com",
            phone: "11999990002",
            password: "123456",
            token_password: passwordHash,
            type: "teacher",
            level: 2,
        },
    });

    // === Classes ===
    const class1 = await prisma.class.create({
        data: {
            name: "Turma A",
            professor_id: user1.id,
        },
    });

    const class2 = await prisma.class.create({
        data: {
            name: "Turma B",
            professor_id: user2.id,
        },
    });

    // === Função para criar um guardião ===
    async function createGuardian(name: string) {
        return prisma.guardian.create({
            data: {
                name,
                birthday: new Date("1980-01-01"),
                cpf: Math.floor(Math.random() * 10000000000).toString().padStart(11, "0"),
                rg: Math.floor(Math.random() * 10000000).toString().padStart(7, "0"),
                kinship: "Pai/Mãe",
                phone: "11999990000",
                workplace: "Empresa X",
                other_phone: "11999990000",
            },
        });
    }

    // === Criar alunos com famílias e outros dados ===
    const studentsData = [
        { name: "Lucas", classId: class1.id },
        { name: "Mariana", classId: class1.id },
        { name: "Gabriel", classId: class2.id },
        { name: "Sofia", classId: class2.id },
        { name: "Pedro", classId: class2.id },
    ];

    for (const s of studentsData) {
        const dad = await createGuardian(`${s.name} Pai`);
        const mom = await createGuardian(`${s.name} Mãe`);
        const guardian = await createGuardian(`${s.name} Responsável`);

        const student = await prisma.student.create({
            data: {
                name: s.name,
                birthday: new Date("2018-01-01"),
                color: "Parda",
                gender: "M",
                status: "Espera",
                dad_id: dad.id,
                mom_id: mom.id,
                guardian_id: guardian.id,
                sus: { "Unidade de Saúde": "", "Número do Cartão SUS": "" },
                address: {
                    create: {
                        street: "Rua A",
                        number: "100",
                        neighborhood: "Centro",
                        city: "São Paulo",
                        state: "SP",
                        cep: "01001000",
                    },
                },
                document: {
                    create: {
                        birth_cert: "123456",
                        registry_city: "São Paulo",
                        birth_city: "São Paulo",
                        cpf: Math.floor(Math.random() * 10000000000).toString().padStart(11, "0"),
                        rg: Math.floor(Math.random() * 10000000).toString().padStart(7, "0"),
                        rg_issue_date: new Date("2018-01-01"),
                        rg_issuer: "SSP",
                    },
                },
                housing: {
                    create: {
                        rent_value: 1200,
                        rooms: 3,
                        septic_tank: false,
                        cifon: true,
                        electricity: true,
                        water: true,
                    },
                },
                asset: {
                    create: {
                        tv: true,
                        computer: true,
                        fridge: true,
                        phone_mobile: true,
                    },
                },
            },
        });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
