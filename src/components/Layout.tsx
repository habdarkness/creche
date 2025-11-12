"use client";
import { SessionProvider } from "next-auth/react";
import { Contexts } from "./Contexts";
import Header from "./Header";
import Menu from "./Menu";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Contexts>
                <div className={`grid grid-rows-[min-content_1fr] h-screen`}>
                    <Header />
                    <Menu />
                    <div className="flex flex-col h-full overflow-y-auto mb-14 md:mb-0 md:ml-23">
                        {children}
                    </div>
                </div>
            </Contexts>
        </SessionProvider>
    )
}