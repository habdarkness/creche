"use client"
import { faFilter, faMagnifyingGlass, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import TabForm from "./TabForm";
import { usePathname } from "next/navigation";
import { useSearch } from "./Contexts";
import { userTypes } from "@/models/UserForm";
import { studentClassifications, studentColor, studentGender, studentMobility, studentStatus } from "@/models/StudentForm";
import FormButton from "./FormButton";
import FormButtonGroup from "./FormButtonGroup";
import FormInput, { FormInputType } from "./FormInput";
import { kinshipTypes } from "@/models/GuardianForm";

type FilterType = "text" | "number" | "date" | "boolean" | string[];
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
                kinship: { name: "Parentesco", type: kinshipTypes }
            });
        }
        else if (lastPath.includes("estudantes")) {
            setFilterOptions({
                status: { name: "Estado da matrícula", type: studentStatus },
                age_group: { name: "Idade", type: ["0–1 anos", "2–3 anos", "4–5 anos", "Mais de 5 anos"] },
                gender: { name: "Sexo", type: studentGender },
                color: { name: "Cor/Raça", type: studentColor },
                twins: { name: "Gemeos", type: "boolean" },
                has_siblings: { name: "Irmãos", type: "boolean" },
                mobility: { name: "Mobilidade Reduzida", type: studentMobility },
                classification: { name: "Classificação", type: studentClassifications }
            });
        }
        else if (lastPath.includes("historico")) {
            setFilterOptions({
                type: { name: "Tipo", type: Object.keys(userTypes) },
                date: { name: "Data", type: "date" }
            });
        }
    }, [pathname]);
    if (Object(filterOptions).length == 0) return;
    return (
        <div className="flex gap-2">
            <div className="flex overflow-clip bg-[#f2f2f2] gap-2 w-full rounded-2xl items-center text-primary">
                <button
                    className={
                        `flex p-2 h-full items-center transition cursor-pointer
                        ${filters.length > 0 ? "bg-primary-darker hover:bg-primary text-white" : "hover:bg-primary-darker hover:text-white"}`
                    }
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
                {filters.length == 0 && (
                    <p className="font-bold text-primary text-center">Nenhum filtro adicionado</p>
                )}
                {filters.map((f, index) => {
                    if (!Object.keys(filterOptions).includes(f.key)) return;
                    const fo = filterOptions[f.key];
                    let options: string[] | [number, string][] | undefined;
                    if (Array.isArray(fo.type)) { options = fo.type }
                    return (
                        <div key={index} className="flex gap-2 items-end">
                            <FontAwesomeIcon icon={faTrash} className=" my-3 text-red-400 hover:scale-125 transition cursor-pointer" onClick={() => {
                                setFilters(prev => prev.filter((_, i) => i !== index));
                            }} />
                            <FormInput
                                key={index}
                                id={f.key}
                                label={fo.name}
                                value={f.value}
                                options={options}
                                type={fo.type as FormInputType}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters(prev =>
                                        prev.map((fil, i) =>
                                            i === index ? { ...fil, value } : fil
                                        )
                                    );
                                }}
                                fullWidth
                            />
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
                            const fo = filterOptions[filter];
                            setFilters(prev => [...prev, { key: filter, value: fo.type == "boolean" ? true : "" }])
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </FormButtonGroup>
            </TabForm>
        </div >
    );
}
