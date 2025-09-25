"use client";

import { useTab } from "@/components/Contexts";
import Loader from "@/components/Loader";
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const inputStyle = "p-2 rounded text-base font-normal bg-background-darker";

export default function Home() {
    const { data: session, status } = useSession();
    const { setTab } = useTab();
    const [form, setForm] = useState({ email: "", pass: "", new_pass: "", confirm_pass: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (status == "authenticated" && !session.user.temporary) {
            setTab("usuarios");
            redirect("usuarios");
        }
    }, [session, status])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setForm({ ...form, [id]: value });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (session?.user.temporary) {
            if (form.new_pass != form.confirm_pass) { return setError("Senhas diferents") }
            if (form.new_pass.length < 6) { return setError("Senha inválida") }
            try {
                const res = await fetch("/api/user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: session.user.id, password: form.new_pass })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                const resLogin = await signIn("credentials", {
                    redirect: false,
                    email: form.email,
                    password: form.new_pass
                });
                if (!resLogin?.ok) { signOut(); }

            }
            catch (error) {
                return Swal.fire({
                    title: "Erro ao criar senha",
                    text: String(error),
                    icon: "error"
                });
            }
        }
        else {
            const res = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.pass
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center m-4 h-full">
            <form
                className="flex flex-col justify-center items-center text-2xl font-bold bg-background p-4 rounded-xl gap-4"
                onSubmit={handleSubmit}
            >
                <h1>Login</h1>
                {status == "loading" ? (
                    <Loader />
                ) : status == "unauthenticated" ? (
                    <>
                        <input
                            id="email"
                            type="text"
                            placeholder="Email"
                            className={inputStyle}
                            value={form.email}
                            onChange={handleChange}
                        />
                        <input
                            id="pass"
                            type="password"
                            placeholder="Senha"
                            className={inputStyle}
                            value={form.pass}
                            onChange={handleChange}
                        />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="bg-primary text-lg px-2 py-1 rounded-full hover:scale-105 transition"
                        >
                            Entrar
                        </button>
                    </>
                ) : session?.user.temporary && (
                    <>
                        <input
                            id="new_pass"
                            type="password"
                            placeholder="Senha"
                            className={inputStyle}
                            value={form.new_pass}
                            onChange={handleChange}
                        />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <input
                            id="confirm_pass"
                            type="password"
                            placeholder="Confirme a senha"
                            className={inputStyle}
                            value={form.confirm_pass}
                            onChange={handleChange}
                        />
                        <button
                            type="submit"
                            className="bg-primary text-lg px-2 py-1 rounded-full hover:scale-105 transition"
                        >
                            Criar senha
                        </button>
                    </>
                )
                }
            </form>
        </div>
    );
}
