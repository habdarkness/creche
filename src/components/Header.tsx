"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardUser, faMoon, faSun, faRightFromBracket, faGear, faUser } from "@fortawesome/free-solid-svg-icons";
import { useSession, signOut } from "next-auth/react";
import { capitalize, formatLink } from "@/lib/format";
import { useSearch } from "@/components/Contexts";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import Image from "next/image";

export default function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();

    const pages = {
        "Minha Conta": faUser,
        "Sair": faRightFromBracket
    }
    const [userName, setUserName] = useState("");
    const { search, setSearch } = useSearch();
    const [dark, setDark] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        //verificar thema
        const storedTheme = localStorage.getItem("theme");
        const light = storedTheme === "light";
        setTheme(light);
        setDark(!light);
        //verificar o tamanho da tela
        const updateScreenSize = () => { setIsMobile(window.innerWidth < 768); };
        updateScreenSize();
        window.addEventListener("resize", updateScreenSize);
        return () => window.removeEventListener("resize", updateScreenSize);
    }, [pathname]);

    useEffect(() => {
        if (session) { setUserName(capitalize(session.user.name, true)); }
    }, [session, status]);

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
    return (
        <header className="flex flex-col gap-1 w-full bg-background p-2" onMouseLeave={() => setHovered(false)}>
            <div className="flex flex-row items-center gap-4 w-full">
                <div className="flex gap-4 w-full items-center">
                    <Image
                        src="/favicon.png"
                        alt="Logo da Creche Estrela"
                        width={64}
                        height={64}
                        className="size-[48px]"
                        priority
                    />
                    {!isMobile && (<h1 className="text-2xl font-bold">Estrela do Oriente</h1>)}
                    {session && !session.user.temporary && (
                        <div className="mx-auto hidden sm:flex"><SearchBar value={search} onChange={setSearch} /></div>
                    )}
                </div>
                {/* User */}
                {session && !session.user.temporary && (
                    <div
                        className="relative flex items-center gap-2"
                        onMouseEnter={() => setHovered(true)}
                    >
                        <h1 className="text-reverse text-lg font-bold whitespace-nowrap">{userName}</h1>
                        <FontAwesomeIcon className="text-reverse text-2xl ml" icon={faClipboardUser} />
                        <div
                            className={`
                                    absolute translate-y-[75%] flex flex-col items-center
                                    rounded-xl bg-background ${!hovered && "scale-x-0"} overflow-clip
                                    border-2 border-background-darker text-reverse transition-all
                                `}
                        >
                            {Object.entries(pages).map(([name, icon]) => (
                                <button
                                    key={name}
                                    className="flex gap-2 w-full justify-end px-2 py-1 hover:bg-primary transition items-center cursor-pointer"
                                    onClick={() => name == "Sair" ? signOut() : router.push(formatLink(name))}
                                >
                                    <h1 className="whitespace-nowrap">{name}</h1>
                                    <FontAwesomeIcon icon={icon} className="text-lg" />
                                </button>
                            ))}
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
            {session && !session.user.temporary && (
                <div className="mx-auto flex sm:hidden"><SearchBar value={search} onChange={setSearch} /></div>
            )}
        </header >
    );
}
