"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";

const inputStyle = "p-2 rounded text-base font-normal bg-background-darker";

export default function Home() {
    const [form, setForm] = useState({ email: "", pass: "" });
    const [error, setError] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setForm({ ...form, [id]: value });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            redirect: false,
            email: "hugo@email.com",
            password: "senha123"
        });

        if (res?.error) {
            setError("Usuário ou senha inválidos");
        } else {
            console.log("Login feito com sucesso!", res);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center m-4 h-full">
            <form
                className="flex flex-col justify-center items-center text-2xl font-bold bg-background p-4 rounded-xl gap-4"
                onSubmit={handleSubmit}
            >
                <h1>Login</h1>

                <input
                    id="email"
                    type="text"
                    placeholder="Email"
                    className={inputStyle}
                    onChange={handleChange}
                />

                <input
                    id="pass"
                    type="password"
                    placeholder="Senha"
                    className={inputStyle}
                    onChange={handleChange}
                />

                {error && <p className="text-red-400">{error}</p>}

                <button
                    type="submit"
                    className="bg-primary text-lg px-2 py-1 rounded-full hover:scale-105 transition"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}
