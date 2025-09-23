const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

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
    console.log("Admin criado!");
    prisma.$disconnect();
});
