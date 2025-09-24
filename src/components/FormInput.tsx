"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type Props = {
    id: string;
    label?: string;
    placeholder?: string;
    icon?: IconProp;
    type?: "text" | "password" | "date" | "number" | "time";
    textArea?: boolean;
    value: string | number | boolean;
    editable?: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    fullWidth?: boolean;
}

export default function FormInput({
    id, label = "", icon, fullWidth = false,
    placeholder = "Digite " + label.toLowerCase() + "...",
    type = "text", textArea = false,
    value, onChange, editable = true
}: Props) {
    function initialCapitalize(str: string): string { return str.charAt(0).toUpperCase() + str.slice(1); }
    return (
        <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
            <label htmlFor={id} className="text-primary font-bold">{label}</label>
            <div className="flex gap-1 bg-primary-darker text-white rounded-md p-2 w-full">
                {icon && (<FontAwesomeIcon icon={icon} />)}
                {textArea ? (
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
        </div>
    )
}