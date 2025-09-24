import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            level: number;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        name: string;
        email: string;
        level: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string;
        email: string;
        level: number;
    }
}
