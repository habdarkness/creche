"use client"

import { faGraduationCap, faPeopleRoof, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTab } from "./Contexts";
import { useEffect } from "react";

export default function Menu() {
    const { data: session, status } = useSession();
    const tabs = {
        ...(session
            ? session.user.level <= 2
                ? { "Usuários": faUser, "Responsáveis": faPeopleRoof }
                : {}
            : {}),
        "Estudantes": faGraduationCap,
    }
    const { tab, setTab } = useTab();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!session || status !== "authenticated") return;

        const lastPath = pathname.split("/").pop() || "";
        const validPaths = Object.keys(tabs).map(name => formatTab(name));
        const currentTab = validPaths.find(p => lastPath.includes(p));

        if (currentTab) setTab(currentTab);
        else if (validPaths.length > 0) router.push("/" + validPaths[0]);
    }, [pathname, session, status]);

    function changeTab(newTab: string) {
        router.push(newTab);
        setTab(newTab);
    }
    function formatTab(name: string) {
        return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    return (
        <div
            className="
                fixed
                bg-background p-4 gap-4 items-center
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
                <div
                    key={name}
                    className={`contents cursor-pointer hover:text-primary transition ${tab == formatTab(name) ? "text-primary" : "text-reverse"}`}
                    onClick={() => changeTab(formatTab(name))}
                >
                    <FontAwesomeIcon icon={icon} className="text-2xl mx-auto" />
                    <span className="font-bold transition-all max-w-0 group-hover:max-w-[200px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">{name}</span>
                </div>

            ))}
        </div>
    )
}