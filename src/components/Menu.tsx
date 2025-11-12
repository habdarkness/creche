"use client"

import { faClockRotateLeft, faGraduationCap, faPeopleRoof, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTab } from "./Contexts";
import { useEffect } from "react";
import { formatLink } from "@/lib/format";

export default function Menu() {
    const { data: session, status } = useSession();
    const tabs = {
        "Estudantes": faGraduationCap,
        ...(session
            ? session.user.level <= 2
                ? { "Responsáveis": faPeopleRoof, "Usuários": faUser, ...(session.user.level <= 1 ? { "Histórico": faClockRotateLeft } : {}) }
                : {}
            : {}),
    }
    const { tab, setTab } = useTab();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status == "loading") return;
        if (status == "unauthenticated" || (session && session.user.temporary)) {
            router.push("/");
            return
        };

        const lastPath = pathname.split("/").pop() || "";
        const validPaths = [...Object.keys(tabs).map(name => formatLink(name)), "minha-conta"];
        const currentTab = validPaths.find(p => lastPath.includes(p));
        if (currentTab) setTab(currentTab);
        else if (validPaths.length > 0) {
            if (pathname == "/") { changeTab("/" + validPaths[0]) }
            else { changeTab("/nao-autorizado") }
        }
        else { changeTab("/nao-autorizado") }
    }, [pathname, session, status]);

    function changeTab(newTab: string) {
        router.push(newTab);
        setTab(newTab);
    }
    if (!session || status != "authenticated" || session.user.temporary) return;
    return (
        <div
            className="
                fixed
                bg-background p-4 gap-y-4 items-center
                transition-all overflow-hidden group
                z-50

                bottom-0 left-0 right-0 
                flex flex-row justify-around
                rounded-none

                md:top-1/2 md:left-6 md:right-auto md:bottom-auto 
                md:-translate-y-1/2
                md:grid md:[grid-template-columns:min-content_auto]
                md:rounded-2xl md:max-w-[61px] md:hover:max-w-[500px]
            "
        >
            {Object.entries(tabs).map(([name, icon]) => (
                <button
                    key={name}
                    className={`contents cursor-pointer hover:text-primary transition ${tab == formatLink(name) ? "text-primary" : "text-reverse"}`}
                    onClick={() => changeTab(formatLink(name))}
                >
                    <FontAwesomeIcon icon={icon} className="text-2xl mx-auto" />
                    <span className="font-bold hidden md:flex transition-all md:pl-2 md:text-left max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">{name}</span>
                </button>
            ))}
        </div>
    )
}