"use client";

import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize } from "@/lib/capitalize";
import { GuadianWithRelations } from "@/types/prismaTypes";
import { faCakeCandles, faEnvelope, faPhone, faUser, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { GuardianForm } from "@/models/GuardianForm";

export default function Guardians() {
    const [guardians, setGuardians] = useState<GuadianWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<GuardianForm>(new GuardianForm());


    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const res = await fetch("/api/guardian");
                const dataStudent = await res.json();
                setGuardians(dataStudent);
            }
            catch (error) { console.error("Erro ao buscar responsáveis:", error); }
            finally { setLoading(false); }
        };
        fetchStudents();
    }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new GuardianForm({
            ...prev,
            [id]: value
        }));
    }
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        console.log(form.getData())
        const message = form.verify()
        if (message) return Swal.fire({
            title: "Erro de validação",
            text: message,
            icon: "error"
        });
        try {
            const res = await fetch("/api/guardian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            setGuardians(prev => {
                const index = prev.findIndex(u => u.id === data.guardian.id);
                if (index !== -1) {
                    const newguardians = [...prev];
                    newguardians[index] = data.guardian;
                    return newguardians;
                }
                else {
                    return [...prev, data.guardian];
                }
            });

            Swal.fire({
                title: `Responsável ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                icon: "success"
            });
            setForm(new GuardianForm());
            setFormVisible(false);
        }
        catch (error) {
            return Swal.fire({
                title: "Erro no cadastro/atualização",
                text: String(error),
                icon: "error"
            });
        }
    }
    if (loading) return (<div className="flex items-center justify-center h-full"><Loader /></div>)
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Responsáveis</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {guardians.map(guardian => (
                    <li key={guardian.id} className="flex flex-col  bg-primary-darker p-2 rounded-2xl hover:scale-105 transition" onClick={() => {
                        setForm(new GuardianForm({ ...guardian }));
                        setFormVisible(true);
                    }}>
                        <p className="font-bold text-lg">{capitalize(guardian.name)}</p>
                        <p className="text-sm">{guardian.email}</p>
                        <p className="text-sm">{capitalize(guardian.phone)}</p>
                    </li>
                ))}
            </ul>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit} submit={form.id == -1 ? "Cadastrar" : "Atualizar"}>
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput id="email" label="Email" icon={faEnvelope} value={form.email} onChange={handleChange} />
                <FormInput id="phone" label="Telefone" icon={faPhone} value={form.phone} onChange={handleChange} />
            </TabForm>
            <PageButton text="Cadastrar" icon={faUser} onClick={() => { setForm(new GuardianForm()); setFormVisible(true) }} />
        </div>
    );
}
