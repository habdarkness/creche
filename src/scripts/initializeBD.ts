import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("123456", 10);

    // === Usuário administrador ===
    await prisma.user.create({
        data: {
            name: "administrador",
            email: "administrador@email.com",
            password: passwordHash,
            token_password: passwordHash,
            type: "Administrador",
            phone: "98999999999",
            level: 1,
        },
    });

    // === Usuários (secretário e professor) ===
    const user1 = await prisma.user.create({
        data: {
            name: "Alice Silva",
            email: "alice@email.com",
            phone: "11999990001",
            password: passwordHash,
            token_password: passwordHash,
            type: "Secretário",
            level: 2,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Bruno Souza",
            email: "bruno@email.com",
            phone: "11999990002",
            password: passwordHash,
            token_password: passwordHash,
            type: "Professor",
            level: 3,
        },
    });

    // === Função para criar guardião (pai ou mãe) ===
    async function createGuardian(name: string, kinship: "Pai" | "Mãe") {
        return prisma.guardian.create({
            data: {
                name,
                birthday: new Date("1980-01-01"),
                cpf: Math.floor(Math.random() * 10000000000)
                    .toString()
                    .padStart(11, "0"),
                rg: Math.floor(Math.random() * 10000000)
                    .toString()
                    .padStart(7, "0"),
                kinship,
                phone: "11999990000",
                workplace: "Empresa X",
                other_phone: "11999990000",
            },
        });
    }

    // === Criar alunos com pai/mãe e dados relacionados ===
    const studentsData = ["Lucas", "Mariana", "Gabriel", "Sofia", "Pedro"];

    for (const s of studentsData) {
        const dad = await createGuardian(`${s} Pai`, "Pai");
        const mom = await createGuardian(`${s} Mãe`, "Mãe");

        // escolher aleatoriamente quem é o responsável
        const guardian = Math.random() > 0.5 ? dad : mom;

        await prisma.student.create({
            data: {
                name: s,
                birthday: new Date("2018-01-01"),
                color: "Parda",
                gender: "M",
                status: "Espera",
                dad_id: dad.id,
                mom_id: mom.id,
                guardian_id: guardian.id,
                sus: { "Unidade de Saúde": "", "Número do Cartão SUS": "" },
                family: [
                    {
                        nome: "",
                        parentesco: "",
                        idade: 0,
                        educação: "",
                        profissão: "",
                        sálario: 0,
                    },
                ],
                authorized: [
                    { nome: "", parentesco: "", rg: "", contato: "" },
                ],
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
                        cpf: Math.floor(Math.random() * 10000000000)
                            .toString()
                            .padStart(11, "0"),
                        rg: Math.floor(Math.random() * 10000000)
                            .toString()
                            .padStart(7, "0"),
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

main()
    .then(() => {
        console.log("Base de dados criada com sucesso!");
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
