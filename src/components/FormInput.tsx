"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Switch from "./Switch";
import { capitalize } from "@/lib/format";
import { stringify } from "querystring";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
    id: string;
    label?: string;
    placeholder?: string;
    icon?: IconProp;
    type?: "text" | "textarea" | "bool" | "password" | "date" | "number" | "time";
    options?: [number, string][] | string[];
    keys?: Record<string, "string" | "number" | "date">;
    flexible?: string;

    value: string | number | boolean | Record<string, string> | Record<string, string>[];
    editable?: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    fullWidth?: boolean;
}

export default function FormInput({
    id, label = "", icon, fullWidth = false,
    placeholder = "Digite " + label.toLowerCase() + "...",
    type = "text", options, keys, flexible = "",
    value, onChange, editable = true
}: Props) {
    const objectValue = typeof value === "object" ? Array.isArray(value) ? value : [value] : [];
    return (
        <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
            {keys ? (
                <div className="flex flex-col gap-2 text-white">
                    <label htmlFor={id} className="text-primary font-bold">{label}</label>
                    {objectValue.map((v, i) => (
                        <div className="flex gap-2 items-center">
                            <div key={i} className="grid grid-cols-[min-content_1fr] w-full bg-primary-darker p-2 rounded-md gap-2 items-center">
                                {Object.entries(keys).map(([key, type]) => (
                                    <React.Fragment key={key}>
                                        <h1>{capitalize(key)}</h1>
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
                                            placeholder={`Digite ${key}...`}
                                            className="bg-white text-primary-darker p-1 rounded-sm w-full"
                                            readOnly={!editable}
                                        />
                                    </React.Fragment>
                                ))}
                            </div>
                            {Array.isArray(value) && (
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="text-primary-darker text-xl hover:text-red-500 transition"
                                    onClick={() => {
                                        if (Array.isArray(value)) {
                                            const newValue = value.filter((_, index) => index !== i);
                                            onChange({ target: { id, value: newValue } } as any);
                                        }
                                    }}
                                />
                            )}
                        </div>
                    ))}
                    {flexible && Array.isArray(value) && (
                        <button
                            type="button"
                            className="bg-primary-darker mx-auto px-2 py-1 rounded-md hover:scale-105 transition"
                            onClick={() => {
                                const newValue = [...value, Object.fromEntries(Object.keys(keys).map(k => [k, ""]))];
                                onChange({ target: { id, value: newValue } } as any);
                            }}
                        >
                            Adicionar {flexible}
                        </button>
                    )}
                </div>
            ) : type == "bool" ? (
                <div className="flex items-center gap-2 text-primary font-bold">
                    {label} <Switch checked={value as boolean} setChecked={(checked) => onChange({ target: { id, value: checked ? "true" : "false" } } as any)} />
                </div>
            ) : (
                <>
                    <label htmlFor={id} className="text-primary font-bold">{label}</label>
                    <div className="flex gap-1 bg-primary-darker text-white rounded-md p-2 w-full items-center">
                        {icon && (<FontAwesomeIcon icon={icon} />)}
                        {options ? (
                            <select
                                id={id}
                                name={id}
                                value={
                                    typeof value == "object" ? value.toString()
                                        : typeof value === "boolean" ? String(value)
                                            : value
                                }
                                onChange={onChange}
                                className="w-full bg-transparent"
                                disabled={!editable}
                            >
                                {options.map((opt) =>
                                    Array.isArray(opt) ? (
                                        <option key={opt[0]} value={opt[0]} className="text-primary">
                                            {opt[1]}
                                        </option>
                                    ) : (
                                        <option key={opt} value={opt} className="text-primary">
                                            {opt}
                                        </option>
                                    )
                                )}
                            </select>
                        ) : type == "textarea" ? (
                            <textarea
                                id={id}
                                name={id}
                                rows={4}
                                value={value as string}
                                onChange={onChange}
                                placeholder={placeholder}
                                className="w-full mb-[-5px] min-h-[100px]"
                                readOnly={!editable}
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
                                readOnly={!editable}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}