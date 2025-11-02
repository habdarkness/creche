"use client";

import { useSearch } from "@/components/Contexts";
import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import StudentTabForm from "@/components/StudentTabForm";
import TabForm from "@/components/TabForm";
import { capitalize, cleanObject } from "@/lib/format";
import { prismaDate } from "@/lib/prismaLib";
import { GuardianForm } from "@/models/GuardianForm";
import { StudentForm } from "@/models/StudentForm";
import { GuardianWithRelations } from "@/types/prismaTypes";
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { Student } from "@prisma/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Guardians() {
    const [guardians, setGuardians] = useState<GuardianWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<GuardianForm>(new GuardianForm());
    const [studentFormVisible, setStudentFormVisible] = useState(false);
    const [studentForm, setStudentForm] = useState<StudentForm>(new StudentForm())
    const { search } = useSearch();

    useEffect(() => {
        async function fetchGuardians() {
            try {
                setLoading(true);
                const res = await fetch("/api/guardian");
                const data = await res.json();
                setGuardians(Array.isArray(data) ? data : []);
            }
            catch (error) {
                console.error("Erro ao buscar responsáveis:", error);
                setGuardians([]);
            }
            finally { setLoading(false); }
        };
        fetchGuardians();
    }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new GuardianForm({ ...prev, [id]: value }));
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
                    const newGuardians = [...prev];
                    newGuardians[index] = data.guardian;
                    return newGuardians;
                }
                else {
                    return [...prev, data.guardian];
                }
            });

            Swal.fire({
                title: `Usuário ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
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

    function handleStudentChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setStudentForm(prev => new StudentForm({
            ...prev,
            [id]: id === "guardian_id"
                ? Number(value)
                : id === "birthday"
                    ? (value ? new Date(value) : null)
                    : value
        }));
    }
    async function handleStudentSubmit(event: React.FormEvent) {
        event.preventDefault();
        const message = form.verify()
        if (message) return Swal.fire({
            title: "Erro de validação",
            html: message,
            icon: "error"
        });
        try {
            const res = await fetch("/api/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            setGuardians(prev => {
                return [...prev]
            });
            // setStudents(prev => {
            //     const index = prev.findIndex(u => u.id === data.student.id);
            //     if (index !== -1) {
            //         const newStudents = [...prev];
            //         newStudents[index] = data.student;
            //         return newStudents;
            //     }
            //     else {
            //         return [...prev, data.student];
            //     }
            // });

            Swal.fire({
                title: `Estudante ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                icon: "success"
            });
            setStudentForm(new StudentForm());
            setStudentFormVisible(false);
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
    const filtered = guardians.filter(guardian => {
        if (!guardian) return false;
        const term = search.toLowerCase();
        const userTerm = (guardian.name).toLowerCase();
        return userTerm.includes(term);
    })
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Responsáveis</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {filtered.map(guardian => (
                    <li key={guardian.id} className="flex flex-col  bg-primary-darker p-2 rounded-2xl hover:scale-105 transition" onClick={() => {
                        setForm(new GuardianForm({ ...guardian }));
                        setFormVisible(true);
                    }}>
                        <div className="flex justify-between gap-1 flex-wrap mb-2">
                            <p className="font-bold text-lg">{capitalize(guardian.name)}</p>
                            <p className="text-sm">{capitalize(guardian.kinship)}</p>
                        </div>
                        <div className="flex justify-between gap-1 flex-wrap">
                            <p className="text-sm">RG: {guardian.rg}</p>
                            <p className="text-sm">Telefone: {guardian.phone}</p>
                        </div>
                        <p className="text-sm">Alunos vinculados: {getStudents(guardian)}</p>
                    </li>
                ))}
            </ul>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit} submit={form.id == -1 ? "Cadastrar" : "Atualizar"} >
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput
                    id="birthday"
                    label="Data de nascimento"
                    type="date"
                    icon={faEnvelope}
                    value={form.birthday ? prismaDate(form.birthday).toISOString().substring(0, 10) : ""}
                    onChange={handleChange}
                />
                <FormInput id="rg" label="RG" icon={faUser} value={form.rg} onChange={handleChange} />
                <FormInput id="cpf" label="CPF" icon={faUser} value={form.cpf} onChange={handleChange} />
                <FormInput id="kinship" label="Parentesco" icon={faUser} value={form.kinship} onChange={handleChange} />
                <FormInput id="phone" label="Telefone" icon={faUser} value={form.phone} onChange={handleChange} />
                <FormInput id="workplace" label="Local de Trabalho" icon={faUser} value={form.workplace} onChange={handleChange} />
                <FormInput id="other_phone" label="Outro Telefone" icon={faUser} value={form.other_phone} onChange={handleChange} />
                <div className="bg-background-darker p-2 rounded-3xl">
                    <p className="text-center text-primary font-bold mb-2">Estudantes vinculados</p>
                    <ul className="grid grid-cols-2 md:grid-cols-3 w-full gap-4">
                        {form.getStudents().map(student => (
                            <li key={student.id} className={`flex flex-col  bg-primary-darker text-white p-2 rounded-2xl hover:bg-primary transition ${student.status != "Matriculado" && "opacity-75"}`} onClick={() => {
                                const clean = cleanObject(student)
                                setStudentForm(new StudentForm({
                                    ...clean,
                                    ...clean.address,
                                    ...clean.housing,
                                    ...clean.asset,
                                    ...clean.document,
                                }));
                                setStudentFormVisible(true);
                            }}>
                                <p className="font-bold text-lg">{capitalize(student.name)}</p>
                                <p className="text-sm">{student.status}</p>
                                <p className="text-sm">
                                    {(() => {
                                        if (!student.birthday) return "Idade desconhecida";
                                        const birthDate = prismaDate(student.birthday);
                                        const today = new Date();
                                        let age = today.getFullYear() - birthDate.getFullYear();
                                        const m = today.getMonth() - birthDate.getMonth();
                                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
                                        return `${age} anos`;
                                    })()}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </TabForm>
            <StudentTabForm form={studentForm} onChange={handleStudentChange} onSubmit={handleStudentSubmit} visible={studentFormVisible} onVisibilityChanged={setStudentFormVisible} guardians={guardians} />
            <PageButton text="Cadastrar" icon={faUser} onClick={() => { setForm(new GuardianForm()); setFormVisible(true); }} />
        </div>
    );
}

function getStudents(guardian: GuardianWithRelations): number {
    const allStudents = [...guardian.dad_of, ...guardian.mom_of, ...guardian.guardian_of];
    const uniqueMap = new Map<number, Student>();
    allStudents.forEach(student => {
        uniqueMap.set(student.id, student);
    })
    console.log(uniqueMap);
    return uniqueMap.size;
}