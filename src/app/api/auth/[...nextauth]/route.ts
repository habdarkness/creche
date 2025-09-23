import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;
				console.log(credentials)
				console.log("database: ", process.env.DATABASE_URL)
				console.log(await prisma.user.findMany());
				const user = await prisma.user.findUnique({where: { email: credentials.email },});
				console.log([user])
				if (!user) return null;

				const isValid = await bcrypt.compare(credentials.password, user.password);
				if (!isValid) return null;

				return {
					id: user.id.toString(),
					name: user.name,
					email: user.email,
					level: user.level,
				};
			},
		}),
	],
	session: { strategy: "jwt" },
	pages: { signIn: "/login" },
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
