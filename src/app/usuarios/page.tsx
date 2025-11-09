"use client";

import Card from "@/components/Card";
import { useSearch } from "@/components/Contexts";
import FormButton from "@/components/FormButton";
import FormButtonGroup from "@/components/FormButtonGroup";
import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize } from "@/lib/format";
import { generateToken } from "@/lib/generateToken";
import { prismaDate } from "@/lib/prismaLib";
import { UserForm, userTypes } from "@/models/UserForm";
import { faBriefcase, faEnvelope, faKey, faUser } from "@fortawesome/free-solid-svg-icons";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<UserForm>(new UserForm({ token_password: generateToken() }));
    const { search } = useSearch();

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const res = await fetch("/api/user");
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
            catch (error) {
                console.error("Erro ao buscar usuários:", error);
                setUsers([]);
            }
            finally { setLoading(false); }
        };
        fetchUsers();
    }, []);
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
                    prev[index] = data.user;
                    return prev;
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
    const filteredUsers = users.filter(user => {
        const term = search.toLowerCase();
        const userTerm = (user.name + user.email + user.type).toLowerCase();
        return userTerm.includes(term);
    })
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {filteredUsers.map(user => (
                    <Card key={user.id} pressable onClick={() => {
                        setForm(new UserForm({ ...user, send_token: false }));
                        setFormVisible(true);
                    }}>
                        <div className="flex justify-between gap-1 flex-wrap">
                            <p className="font-bold text-lg">{capitalize(user.name)}</p>
                            <p className="text-sm">{capitalize(user.type)}</p>
                        </div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-sm mx-auto text-black opacity-50 font-bold">Criado {prismaDate(user.created_at).toLocaleDateString("PT-BR")}</p>
                    </Card>
                ))}
            </ul>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit}>
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput id="email" label="Email" icon={faEnvelope} value={form.email} onChange={handleChange} />
                <FormInput
                    id="type"
                    options={Object.keys(userTypes)}
                    label="Nível de acesso"
                    icon={faBriefcase}
                    value={form.type}
                    onChange={handleChange}
                    fullWidth
                />
                <FormButtonGroup>
                    {form.id != -1 && (
                        <FormButton text={form.send_token ? `Senha: ${form.token_password}` : "Resetar senha"} color="bg-red-400" icon={faKey} onClick={() => setForm(prev => new UserForm({ ...prev, token_password: generateToken(), send_token: true }))} />
                    )}
                    <FormButton submit text={form.id == -1 ? "Cadastrar" : "Atualizar"} />
                </FormButtonGroup>
            </TabForm>
            <PageButton text="Cadastrar" icon={faUser} onClick={() => { setForm(new UserForm()); setFormVisible(true); }} />
        </div>
    );
}
