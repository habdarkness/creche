"use client";

import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize } from "@/lib/capitalize";
import { StudentWithRelations } from "@/types/prismaTypes";
import { faCakeCandles, faUser, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { StudentForm } from "../../models/StudentForm";
import { User } from "@prisma/client";

export default function Users() {
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [guardians, setGuardians] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<StudentForm>(new StudentForm());


    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const resStudent = await fetch("/api/student");
                const dataStudent = await resStudent.json();
                setStudents(dataStudent);

                const resGuardian = await fetch("/api/user?guardian");
                const dataGuardian = await resGuardian.json();
                setGuardians(dataGuardian);
            }
            catch (error) { console.error("Erro ao buscar estudantes:", error); }
            finally { setLoading(false); }
        };
        fetchStudents();
    }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new StudentForm({
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
            const res = await fetch("/api/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            setStudents(prev => {
                const index = prev.findIndex(u => u.id === data.student.id);
                if (index !== -1) {
                    const newStudents = [...prev];
                    newStudents[index] = data.student;
                    return newStudents;
                }
                else {
                    return [...prev, data.student];
                }
            });

            Swal.fire({
                title: `Estudante ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                icon: "success"
            });
            setForm(new StudentForm());
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
    function prismaDate(date: Date) {
        return date instanceof Date
            ? date
            : new Date(date);
    }
    if (loading) return (<div className="flex items-center justify-center h-full"><Loader /></div>)
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {students.map(student => (
                    <li key={student.id} className="flex flex-col  bg-primary-darker p-2 rounded-2xl hover:scale-105 transition" onClick={() => {
                        setForm(new StudentForm());
                        setFormVisible(true);
                    }}>
                        <p className="font-bold text-lg">{capitalize(student.name)}</p>
                        <p className="text-sm">{prismaDate(student.birthday).toLocaleDateString()}</p>
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
                        <p className="text-sm">{capitalize(student.guardian.name)}</p>
                    </li>
                ))}
            </ul>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit} submit={form.id == -1 ? "Cadastrar" : "Atualizar"}>
                <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                <FormInput id="bithday" type="date" label="Aniversário" icon={faCakeCandles} value={form.birthday?.toDateString() ?? ""} onChange={handleChange} />
                <FormInput id="gender" options={["M", "F"]} label="Genero" icon={faVenusMars} value={form.gender} onChange={handleChange} />
                <FormInput id="guardian_id" options={guardians.map((guardian): [number, string] => [guardian.id, guardian.name])} label="Responsável" value={form.guardian_id} onChange={handleChange} />
            </TabForm>
            <PageButton text="Cadastrar" icon={faUser} onClick={() => setFormVisible(true)} />
        </div>
    );
}
