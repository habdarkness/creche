"use client";

import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize } from "@/lib/capitalize";
import { UserForm } from "@/types/UserForm";
import { faArrowUp19, faEnvelope, faKey, faUser } from "@fortawesome/free-solid-svg-icons";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<UserForm>(new UserForm({token_password: generateToken()}));

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/user");
                console.log(res);
                const data = await res.json();
                setUsers(data);
            }
            catch (error) { console.error("Erro ao buscar usuários:", error); }
            finally { setLoading(false); }
        };
        fetchUsers();
    }, []);
    function generateToken() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new UserForm({
            ...prev, [id]: id === "level" ? Number(value) : value
        }));
    }
    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const message = form.verify()
        if (message) return Swal.fire({
            title: "Erro no cadastro/atualização",
            text: message,
            icon: "error"
        });
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            setUsers(prev => {
                const index = prev.findIndex(u => u.id === data.user.id);
                if (index !== -1) {
                    const newUsers = [...prev];
                    newUsers[index] = data.user;
                    return newUsers;
                }
                else {
                    return [...prev, data.user];
                }
            });

            Swal.fire({
                title: `Usuário ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                text: form.send_token ? `A senha de acesso é: ${form.token_password}` : "",
                icon: "success"
            });
            setForm(new UserForm({token_password: generateToken()}));
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
            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {users.map(user => (
                    <li key={user.id} className="flex flex-col  bg-primary-darker p-2 rounded-2xl hover:scale-105 transition" onClick={() => {
                        setForm(new UserForm({...user, send_token: false}));
                        setFormVisible(true);
                    }}>
                        <p className="font-bold text-lg">{capitalize(user.name)}</p>
                        <p className="text-sm">{capitalize(user.email)}</p>
                    </li>
                ))}
            </ul>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit}>
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput id="email" label="Email" icon={faEnvelope} value={form.email} onChange={handleChange} />
                <FormInput id="level" type="number" label="Nível de acesso" icon={faArrowUp19} value={form.level} onChange={handleChange} />
                <div className="flex gap-2 items-center absolute right-[50%] bottom-5 translate-x-1/2">
                    <FormButton submit text={form.id == -1 ? "Cadastrar" : "Atualizar"} />
                    {form.id != -1 && (
                        <FormButton text="Resetar a senha" color="bg-red-400" icon={faKey} onClick={() => setForm(prev => new UserForm({ ...prev, token_password: generateToken(), send_token: true }))} />
                    )}
                </div>
            </TabForm>
            <PageButton text="Cadastrar" icon={faUser} onClick={() => setFormVisible(true)} />
        </div>
    );
}
