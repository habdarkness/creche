import { createContext, useContext, useState } from "react";

type SearchContextType = {
    search: string;
    setSearch: (s: string) => void;
};
type TabContextType = {
    tab: string;
    setTab: (t: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);
const TabContext = createContext<TabContextType | undefined>(undefined);

export function Contexts({ children }: { children: React.ReactNode }) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("funcionarios");
    return (
        <TabContext.Provider value={{ tab, setTab }}>
            <SearchContext.Provider value={{ search, setSearch }}>
                {children}
            </SearchContext.Provider>
        </TabContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useSearch must be used within Provider");
    return context;
}
export function useTab() {
    const context = useContext(TabContext);
    if (!context) throw new Error("useTab must be used within Provider");
    return context;
}