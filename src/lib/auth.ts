import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getServerSession, NextAuthOptions } from "next-auth";
import { use } from "react";

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
                const isTemporary = await bcrypt.compare(user.token_password, user.password);
                
                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    level: user.level,
                    temporary: isTemporary,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.level = user.level;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.level = token.level;
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