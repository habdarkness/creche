"use client";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, DragEvent } from "react";

type FileValue = {
    base64: string;
    name: string;
};

type Props = {
    id: string;
    icon?: IconProp;
    label?: string;
    disabled?: boolean;
    value?: { base64: string; name: string; } | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    maxSizeMb?: number;
};

export default function FileInput({ id, icon, label = "Arquivo", disabled = false, value = null, maxSizeMb = 2, onChange }: Props) {

    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");

    const maxBytes = maxSizeMb * 1024 * 1024;

    async function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function handleFile(file: File) {
        setError("");

        if (file.size > maxBytes) {
            setError(`Arquivo maior que ${maxSizeMb} MB`);
            return;
        }

        const base64 = await fileToBase64(file);

        onChange({
            target: {
                id,
                value: {
                    base64,
                    name: file.name
                }
            }
        } as any);
    }

    function downloadBase64(base64: string, originalName: string) {
        const link = document.createElement("a");
        link.href = base64;
        link.download = originalName;
        link.click();
    }

    function onDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        if (disabled) return;
        setDragging(false);
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <div className="flex flex-col gap-1 text-primary">

            <label className="font-bold flex items-center gap-2">
                {label}

                {value && (
                    <FontAwesomeIcon
                        icon={faFileDownload}
                        className="cursor-pointer hover:scale-125 transition text-primary"
                        onClick={() => downloadBase64(value.base64, value.name)}
                    />
                )}
            </label>

            <div
                onClick={() => {
                    if (!disabled) document.getElementById(id + "_file")?.click();
                }}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`w-43 border-4 border-dashed p-4 rounded-md text-center cursor-pointer hover:bg-primary/50 transition 
                    ${disabled && "opacity-50 cursor-not-allowed"}
                    ${dragging && "bg-primary/50"}
                `}
            >
                <input
                    id={id + "_file"}
                    type="file"
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={disabled}
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleFile(e.target.files[0]);
                        }
                    }}
                />

                <div className="text-sm font-bold text-primary">
                    {value?.base64 ? (
                        <div className="flex gap-1 items-center">
                            {icon && (<FontAwesomeIcon icon={icon} />)}
                            {value.name}
                        </div>
                    ) : (
                        <p>Carregue um Arquivo (max: 2 MB)
                        </p>
                    )}
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
    );
}
