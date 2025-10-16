"use client";
import { SessionProvider } from "next-auth/react";
import { Contexts } from "./Contexts";
import Header from "./Header";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Contexts>
                <div className={`grid grid-rows-[min-content_1fr] h-screen`}>
                    <Header />
                    <div className="flex flex-col h-full overflow-y-auto">
                        {children}
                    </div>
                </div>
            </Contexts>
        </SessionProvider>
    )
}