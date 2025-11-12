import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getServerSession, NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;
                const isTemporary = user.password == user.token_password;
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    level: user.level,
                    type: user.type,
                    temporary: isTemporary,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24,
    },
    jwt: {
        maxAge: 60 * 60 * 24,
    },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = Number(user.id);
                token.name = user.name;
                token.email = user.email;
                token.level = user.level;
                token.type = user.type;
                token.temporary = user.temporary;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.level = token.level;
            session.user.type = token.type;
            session.user.temporary = token.temporary;
            return session;
        },
    },
};


export async function VerifyUser() {
    const session = await getServerSession(authOptions);
    if (!session) return null;
    //usuário logado
    const currentUser = await prisma.user.findUnique({ where: { email: session.user?.email ?? "" }, });
    if (!currentUser) return null;
    return session.user;
}