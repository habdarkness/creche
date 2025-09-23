import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUser() {
    const passwordHash = await bcrypt.hash("senha123", 10);
    await prisma.user.create({
        data: {
            name: "Hugo",
            email: "hugo@email.com",
            password: passwordHash,
            level: 1
        }
    });
}

createUser().then(() => {
    console.log("Usuário admin criado com sucesso!");
    process.exit(0);
}).catch((err) => {
    console.error("Erro ao criar usuário:", err);
    process.exit(1);
});
