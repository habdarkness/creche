"use client"
import { faFilter, faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import TabForm from "./TabForm";
import { usePathname } from "next/navigation";
import { useSearch } from "./Contexts";
import { userTypes } from "@/models/UserForm";
import { studentColor, studentGender, studentStatus } from "@/models/StudentForm";
import FormButton from "./FormButton";
import FormButtonGroup from "./FormButtonGroup";
import FormInput from "./FormInput";

type FilterType = "text" | "number" | "date" | string[];
type Props = {
    value: string
    onChange: (value: string) => void;
}
export default function SearchBar({ value, onChange }: Props) {
    const [formVisible, setFormVisible] = useState(false);
    const [filter, setFilter] = useState("")
    const { filters, setFilters } = useSearch();
    const [filterOptions, setFilterOptions] = useState<Record<string, { name: string, type: FilterType }>>({});
    const pathname = usePathname();
    useEffect(() => {
        setFilters([]);
        const lastPath = pathname.split("/").pop() || "";
        if (lastPath.includes("usuarios")) {
            setFilterOptions({
                type: { name: "Tipo", type: Object.keys(userTypes) }
            });
        }
        else if (lastPath.includes("responsaveis")) {
            setFilterOptions({
                kinship: { name: "Parentesco", type: "text" }
            });
        }
        else if (lastPath.includes("estudantes")) {
            setFilterOptions({
                status: { name: "Estado da matrícula", type: studentStatus },
                age: { name: "Idade", type: "number" },
                gender: { name: "Sexo", type: studentGender },
                color: { name: "Cor/Raça", type: studentColor }
            });
        }
    }, [pathname])
    return (
        <div className="flex gap-2">
            <div className="flex overflow-clip bg-[#f2f2f2] gap-2 w-full rounded-2xl items-center text-primary">
                <button
                    className="flex p-2 h-full items-center hover:bg-primary hover:text-white transition cursor-pointer"
                    onClick={() => setFormVisible(true)}
                >
                    <FontAwesomeIcon icon={faFilter} />
                </button>
                <input
                    type="text"
                    placeholder="Pesquise um nome aqui..."
                    className="flex-1 py-1 outline-none placeholder-primary/50"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <FontAwesomeIcon icon={faMagnifyingGlass} className="pr-2" />
            </div>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)}>
                {filters.map((f, index) => {
                    if (!Object.keys(filterOptions).includes(f.key)) return;
                    const filterOption = filterOptions[f.key];
                    return (
                        <div>
                            <p key={index}>{filterOption.name}</p>
                        </div>
                    )
                })}
                <FormButtonGroup>
                    <select
                        className="bg-primary px-2 py-1 rounded-lg cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option key={0} value="">Selecione um filtro</option>
                        {Object.entries(filterOptions).map(([key, value]) => !Object.keys(filters).includes(key) && (
                            <option key={key} value={key} >{value.name}</option>
                        ))}
                    </select>
                    <button
                        className={`flex size-6 rounded-full p-1 ${filter == "" ? "bg-background-darker" : "bg-primary cursor-pointer hover:scale-125"} transition`}
                        onClick={() => {
                            setFilters(prev => [...prev, { key: filter, value: "" }])
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </FormButtonGroup>
            </TabForm>
        </div >
    );
}
