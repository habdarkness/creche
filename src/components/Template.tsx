"use client";
import { useSession, SessionProvider } from "next-auth/react";
import { Contexts } from "./Contexts";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Contexts>
                <div className={`overflow-y-auto h-full`}>
                    <div className="flex flex-col h-screen">
                        {children}
                    </div>
                </div>
            </Contexts>
        </SessionProvider>
    )
}