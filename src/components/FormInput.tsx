"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo, useState } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Switch from "./Switch";
import { capitalize } from "@/lib/format";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import FileInput from "./FileInput";
export type FormInputType = "text" | "textarea" | "password" | "date" | "number" | "time" | "file"
export type FormInputValues = string | number | boolean | Record<string, any> | Record<string, any>[]
type Props = {
    id: string;
    label?: string;
    placeholder?: string;
    icon?: IconProp;
    type?: FormInputType;
    options?: [number, string][] | string[];
    search?: boolean;
    value: FormInputValues;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    fullWidth?: boolean;
    disabled?: boolean;
}

export default function FormInput({
    id, label = "", icon, fullWidth = false, disabled = false,
    placeholder = disabled ? `${label}` : `Digite ${label.toLowerCase()}...`,
    type = "text", options, search = false, value, onChange
}: Props) {
    const [searchText, setSearchText] = useState("");
    const objectValue = useMemo(() => {
        if (value && typeof value === "object") { return Array.isArray(value) ? value : [value]; }
        return [];
    }, [value]);
    if (value == null) { value = ""; }
    const keys = useMemo(() => {
        if (objectValue.length > 0 && typeof objectValue[0] === "object") {
            return Object.fromEntries(
                Object.entries(objectValue[0]).map(([k, v]) => [
                    k,
                    (typeof v === "object" && v instanceof Date)
                        ? "date"
                        : typeof v
                ])
            );
        }
        return null;
    }, [objectValue]);

    return (
        <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
            {type == "file" ? (
                <FileInput id={id} label={label} icon={icon} onChange={onChange} value={value as { base64: string, name: string } | null} disabled={disabled} />
            ) : keys ? (
                <div className="flex flex-col gap-2 text-white">
                    <label htmlFor={id} className="text-primary font-bold">{label}</label>
                    {objectValue.map((v, i) => (
                        <ul key={i} className="flex gap-2 items-center">
                            <li className="grid grid-cols-[min-content_1fr] w-full bg-primary-darker p-2 rounded-md gap-2 items-center">
                                {Object.entries(keys).map(([key, type]) => (
                                    <React.Fragment key={key}>
                                        <h1 className="text-nowrap">{capitalize(key)}</h1>
                                        <input
                                            type={type}
                                            id={id}
                                            name={id}
                                            value={key in v ? (v[key] as string) : ""}
                                            onChange={(e) => {
                                                if (Array.isArray(value)) {
                                                    const objValue = value;
                                                    objValue[i][key] = e.target.value;
                                                    onChange({ target: { id, value: objValue } } as any)
                                                }
                                                else {
                                                    const objValue = value as Record<string, string>;
                                                    objValue[key] = e.target.value;
                                                    onChange({ target: { id, value: objValue } } as any)
                                                }
                                            }}
                                            placeholder={disabled ? `${key}` : `Digite ${key.toLowerCase()}...`}
                                            className="bg-white text-primary-darker p-1 rounded-sm w-full"
                                            readOnly={disabled}
                                        />
                                    </React.Fragment>
                                ))}
                            </li>
                            {!disabled && Array.isArray(value) && value.length > 1 && (
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="text-red-400 text-xl hover:scale-125 transition"
                                    onClick={() => {
                                        if (Array.isArray(value)) {
                                            const newValue = value.filter((_, index) => index !== i);
                                            onChange({ target: { id, value: newValue } } as any);
                                        }
                                    }}
                                />
                            )}
                        </ul>
                    ))}
                    {!disabled && Array.isArray(value) && (
                        <button
                            type="button"
                            className="bg-primary-darker mx-auto px-2 py-1 rounded-md hover:scale-105 transition"
                            onClick={() => {
                                const newValue = [...value, Object.fromEntries(Object.keys(keys).map(k => [k, ""]))];
                                onChange({ target: { id, value: newValue } } as any);
                            }}
                        >
                            Adicionar
                        </button>
                    )}
                </div>
            ) : typeof value == "boolean" ? (
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Switch checked={value as boolean} setChecked={(checked) => onChange({ target: { id, value: checked ? true : false } } as any)} disabled={disabled} /> {label}
                </div>
            ) : (
                <>
                    <label htmlFor={id} className="text-primary font-bold">{label}</label>
                    <div className="flex gap-1 bg-primary-darker text-white rounded-md p-2 w-full items-center">
                        {icon && (<FontAwesomeIcon icon={icon} />)}
                        {options ? (
                            <div className={`grid ${!disabled && search && "grid-cols-1 gap-2 md:grid-cols-[1fr_2fr]"} w-full`}>
                                {!disabled && search && (
                                    <input
                                        value={searchText}
                                        placeholder="Pesquise..."
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="bg-white rounded-sm text-primary px-2 py-1"
                                    />
                                )}
                                <select
                                    id={id}
                                    name={id}
                                    value={value == null || value === "" || Number.isNaN(value)
                                        ? ""
                                        : Array.isArray(value)
                                            ? value[0]?.toString()
                                            : typeof value === "object"
                                                ? ""
                                                : String(value)
                                    }
                                    onChange={onChange}
                                    className={`w-full ${!disabled && search ? "bg-primary p-2 rounded-sm " : "bg-transparent"} cursor-pointer`}
                                    disabled={disabled}
                                >
                                    {options.length > 0 && Array.isArray(options[0]) ? (
                                        <option value={-1} className={option}>{disabled ? "Não seleciondo" : "Selecione uma opção"}</option>
                                    ) : (
                                        <option value={`Selecione uma opção`} className={option}>{disabled ? "Não seleciondo" : "Selecione uma opção"}</option>
                                    )}
                                    {options.map((opt) => {
                                        if (Array.isArray(opt)) {
                                            if (!opt[1].includes(searchText) && opt[0] != value) return;
                                            return (
                                                <option key={opt[0]} value={opt[0]} className={option}>
                                                    {opt[1]}
                                                </option>
                                            )
                                        }
                                        else {
                                            if (!opt.includes(searchText) && opt != value) return;
                                            return (
                                                <option key={opt} value={opt} className={option}>
                                                    {opt}
                                                </option>
                                            )

                                        }
                                    })}
                                </select>
                            </div>
                        ) : type == "textarea" ? (
                            <textarea
                                id={id}
                                name={id}
                                rows={4}
                                value={value as string}
                                onChange={onChange}
                                placeholder={placeholder}
                                className="w-full mb-[-5px] min-h-[100px]"
                                readOnly={disabled}
                            />
                        ) : (
                            <input
                                type={type}
                                id={id}
                                name={id}
                                value={value as string}
                                step={type == "time" ? "60" : "1"}
                                onChange={onChange}
                                placeholder={placeholder}
                                className="w-full"
                                readOnly={disabled}
                            />
                        )}
                    </div>
                </>
            )
            }
        </div >
    )
}
const option = "text-white bg-primary font-bold"