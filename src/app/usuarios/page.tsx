"use client";

import Card from "@/components/Card";
import CardList from "@/components/CardList";
import { useSearch } from "@/components/Contexts";
import FormButton from "@/components/FormButton";
import FormButtonGroup from "@/components/FormButtonGroup";
import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageLayout from "@/components/PageLayout";
import PageMenu from "@/components/PageMenu";
import TabForm from "@/components/TabForm";
import { capitalize, cleanObject } from "@/lib/format";
import { generateToken } from "@/lib/generateToken";
import matches from "@/lib/matches";
import { prismaDate } from "@/lib/prismaLib";
import { UserForm, userTypes } from "@/models/UserForm";
import { faBriefcase, faEnvelope, faKey, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Users() {
    const { data: session } = useSession();
    const { filters, search } = useSearch();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<UserForm>(new UserForm({ token_password: generateToken() }));

    async function fetchUsers() {
        try {
            if (!formVisible) setLoading(true);
            const res = await fetch("/api/user");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
                if (form.id > -1) {
                    const user = data.find((u: User) => u.id == form.id);
                    const clean = cleanObject(user)
                    setForm(new UserForm(clean));
                }
            }
        }
        catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setUsers([]);
        }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchUsers(); }, []);
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
            title: "Erro de validação",
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
                title: `Erro ${form.id == -1 ? "no cadastrado" : "na atualização"}`,
                text: String(error),
                icon: "error"
            });
        }
    }

    async function handleDelete(id: number) {
        const user = users.find(g => g.id == id);
        Swal.fire({
            title: `Tem certeza que deseja deletar o usuário ${user && `${user.name} (tipo: ${user.type}, lavel: ${user.level})`}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch("/api/user", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                setForm(new UserForm());
                setFormVisible(false);
                fetchUsers();
                Swal.fire({
                    title: "Usuário deletado com sucesso",
                    icon: "success"
                });
            }
            catch (error) {
                return Swal.fire({
                    title: "Erro ao deletar",
                    text: String(error),
                    icon: "error"
                });
            }
        });
    }
    const filtered = users.filter(user => {
        const of = new UserForm(cleanObject(user)).getFiltered();
        return matches(of, search, filters);
    });
    return (
        <PageLayout title="Usuários" loading={loading}>
            <CardList>
                {filtered.map(user => (
                    <Card key={user.id} pressable onClick={() => {
                        setForm(new UserForm({ ...user, send_token: false }));
                        setFormVisible(true);
                    }}>
                        <div className="flex justify-between gap-1 flex-wrap">
                            <p className="font-bold text-lg">{capitalize(user.name)}</p>
                            <p className="text-sm font-bold text-black opacity-50">{capitalize(user.type)}</p>
                        </div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-sm mx-auto text-black opacity-50 font-bold">Criado {prismaDate(user.created_at).toLocaleDateString("PT-BR")}</p>
                    </Card>
                ))}
            </CardList>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit}>
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput id="email" label="Email" icon={faEnvelope} value={form.email} onChange={handleChange} />
                <FormInput
                    id="type"
                    options={session ? Object.entries(userTypes).filter(([_, level]) => level > session.user.level || session.user.level == 1).map(([role]) => role) : []}
                    label="Tipo"
                    icon={faBriefcase}
                    value={form.type}
                    onChange={handleChange}
                    fullWidth
                    disabled={session?.user.id == form.id}
                />
                <FormButtonGroup>
                    {form.id != -1 && (
                        <>
                            <FormButton color="bg-red-400" icon={faTrash} onClick={() => handleDelete(form.id)} />
                            <FormButton text={form.send_token ? `Senha: ${form.token_password}` : "Resetar senha"} color="bg-yellow-600" icon={faKey} onClick={() => setForm(prev => new UserForm({ ...prev, token_password: generateToken(), send_token: true }))} />
                        </>
                    )}
                    <FormButton submit text={form.id == -1 ? "Cadastrar" : "Atualizar"} />
                </FormButtonGroup>
            </TabForm>
            <PageMenu options={{ "Cadastrar": faUser }} onSelect={(index) => { setForm(new UserForm()); setFormVisible(true); }} />
        </PageLayout>
    );
}
