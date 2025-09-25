"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Switch from "./Switch";

type Props = {
    id: string;
    label?: string;
    placeholder?: string;
    icon?: IconProp;
    type?: "text" | "textarea" | "bool" | "password" | "date" | "number" | "time";
    options?: [number, string][] | string[];
    value: string | number | boolean;
    editable?: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    fullWidth?: boolean;
}

export default function FormInput({
    id, label = "", icon, fullWidth = false,
    placeholder = "Digite " + label.toLowerCase() + "...",
    type = "text", options,
    value, onChange, editable = true
}: Props) {
    return (
        <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
            {type == "bool" ? (
                <div className="flex items-center gap-2 text-primary font-bold">
                    {label} <Switch checked={value as boolean} setChecked={(checked) => onChange({ target: { id, value: checked ? "true" : "false" } } as any)} />
                </div>
            ) : (
                <>
                    <label htmlFor={id} className="text-primary font-bold">{label}</label>
                    <div className="flex gap-1 bg-primary-darker text-white rounded-md p-2 w-full">
                        {icon && (<FontAwesomeIcon icon={icon} />)}
                        {options ? (
                            <select
                                id={id}
                                name={id}
                                value={typeof value === "boolean" ? String(value) : value}
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