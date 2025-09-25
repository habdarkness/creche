"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardUser, faMoon, faSun, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useSession, signOut } from "next-auth/react";
import { capitalize } from "@/lib/capitalize";
import { useSearch, useTab } from "@/components/Contexts";
import { redirect, usePathname, useRouter } from "next/navigation";
import SearchBar from "./SearchBar";

export default function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [userName, setUserName] = useState("");
    const { search, setSearch } = useSearch();
    const [dark, setDark] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { tab, setTab } = useTab();
    const [hovered, setHovered] = useState(false);
    const router = useRouter();

    useEffect(() => {
        //verificar thema
        const storedTheme = localStorage.getItem("theme");
        const light = storedTheme === "light";
        setTheme(light);
        setDark(!light);
        //aba
        const lastPath = pathname.split("/").pop();
        if (lastPath?.includes("usuarios")) { setTab("usuarios") }
        else if (lastPath?.includes("estudantes")) { setTab("estudantes") }
        //verificar o tamanho da tela
        const updateScreenSize = () => { setIsMobile(window.innerWidth < 768); };
        updateScreenSize();
        window.addEventListener("resize", updateScreenSize);
        return () => window.removeEventListener("resize", updateScreenSize);
    }, [pathname]);

    useEffect(() => {
        if (session) { setUserName(capitalize(session.user.name, true)); }
        if (status == "authenticated" && pathname != "/") {
            if (session.user.temporary) { router.push("/") }
        }
        else if (status == "unauthenticated" && pathname != "/") { router.push("/") }
    }, [session, status, pathname]);

    function setTheme(light: boolean) {
        if (light) {
            document.documentElement.style.setProperty('--background', "#fff");
            document.documentElement.style.setProperty('--background-darker', "#eaeaea");
            document.documentElement.style.setProperty('--foreground', "black");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.style.setProperty('--background', "#242738");
            document.documentElement.style.setProperty('--background-darker', "#171219");
            document.documentElement.style.setProperty('--foreground', "white");
            localStorage.setItem("theme", "dark");
        }
        setDark(!light);
    }

    function toggleTheme() { setTheme(dark); }
    function changeTab(newTab: string) {
        setTab(newTab);
        redirect(newTab);
    }
    if (!session || window.location.pathname == "") return null;
    return (
        <header className="w-full bg-background p-2" onMouseLeave={() => setHovered(false)}>
            <div className="flex flex-row items-center gap-4 w-full">
                <div className="flex gap-4 w-full items-center">
                    <h1>Creche Estrela</h1>
                    {session && !session.user.temporary && (
                        <>
                            <div className="flex bg-background-darker rounded-full p-1">
                                <button
                                    onClick={() => changeTab("usuarios")}
                                    className={`px-2 py-1 rounded-full  ${tab == "usuarios" ? "bg-background text-primary" : "hover:bg-background/50"} transition`}
                                >
                                    Usuários
                                </button>
                                <button
                                    onClick={() => changeTab("estudantes")}
                                    className={`px-2 py-1 rounded-full ${tab == "estudantes" ? "bg-background text-primary" : "hover:bg-background/50"} transition`}
                                >
                                    Estudantes
                                </button>
                            </div>
                            <div className="mx-auto">
                                <SearchBar value={search} onChange={setSearch} />
                            </div>
                        </>
                    )}
                </div>
                {/* User */}
                {session && !session.user.temporary && (
                    <div
                        className="relative flex items-center gap-2"
                        onMouseEnter={() => setHovered(true)}
                    >
                        <h1 className="text-reverse text-xl whitespace-nowrap">{userName}</h1>
                        <FontAwesomeIcon className="text-reverse text-2xl ml" icon={faClipboardUser} />
                        <div
                            className={`
                                    absolute translate-y-[50%] mt-8 flex flex-col items-center gap-2 px-4 py-2
                                    w-full rounded-xl bg-background ${!hovered && "scale-x-0"}
                                    border-2 border-background-darker text-reverse transition-all cursor-pointer
                                `}
                        >
                            <div className="flex gap-2 hover:text-primary hover:scale-105 transition" onClick={() => signOut()}>
                                <h1 className="text-xl whitespace-nowrap">Sair</h1>
                                <FontAwesomeIcon icon={faRightFromBracket} className="text-2xl" />
                            </div>
                        </div>
                    </div>
                )}
                {/* Tema */}
                <FontAwesomeIcon
                    icon={dark ? faSun : faMoon}
                    className="text-2xl hover:text-primary cursor-pointer"
                    onClick={toggleTheme}
                />
            </div>
        </header >
    );
}
