import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            level: number;
            type: string;
            temporary: boolean;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        name: string;
        email: string;
        level: number;
        type: string;
        temporary: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string;
        email: string;
        level: number;
        type: string;
        temporary: boolean;
    }
}
