import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUser() {
    const passwordHash = await bcrypt.hash("123456", 10);
    await prisma.user.create({
        data: {
            name: "administrador",
            email: "administrador@email.com",
            password: passwordHash,
            token_password: passwordHash,
            type: "Administrador",
            guardian: false,
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
