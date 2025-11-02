"use client";

import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize, cleanObject } from "@/lib/format";
import { GuardianWithRelations, StudentWithRelations } from "@/types/prismaTypes";
import { faCakeCandles, faUser, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { studentBuildings, studentClassifications, studentFloors, StudentForm, studentHouses, studentMobility, studentRoofs, studentStatus } from "../../models/StudentForm";
import { prismaDate } from "@/lib/prismaLib";
import StudentTabForm from "@/components/StudentTabForm";
import { useSearch } from "@/components/Contexts";

export default function Students() {
    const { search } = useSearch();
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<StudentForm>(new StudentForm());
    const [guardians, setGuardians] = useState<GuardianWithRelations[]>([]);

    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const resStudent = await fetch("/api/student");
                const dataStudent = await resStudent.json();
                if (resStudent.ok) { setStudents(dataStudent); }

                const resGuardian = await fetch("/api/guardian");
                const dataGuardian = await resGuardian.json();
                if (resGuardian.ok) { setGuardians(dataGuardian); }
            }
            catch (error) { console.error("Erro ao buscar estudantes:", error); }
            finally { setLoading(false); }
        };
        fetchStudents();
    }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new StudentForm({
            ...prev,
            [id]: id === "guardian_id"
                ? Number(value)
                : id === "birthday"
                    ? (value ? new Date(value) : null)
                    : value
        }));
    }
    async function handleSubmit(event: React.FormEvent) {
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
    const filtered = students.filter(student => {
        const term = search.toLowerCase();
        const userTerm = (student.name).toLowerCase();
        return userTerm.includes(term);
    })
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Estudantes</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {filtered.map(student => (
                    <li key={student.id} className={`flex flex-col  bg-primary-darker p-2 rounded-2xl hover:bg-primary transition ${student.status != "Matriculado" && "opacity-75"}`} onClick={() => {
                        const clean = cleanObject(student)
                        console.log(clean)
                        setForm(new StudentForm({
                            ...clean,
                            ...clean.address,
                            ...clean.housing,
                            ...clean.asset,
                            ...clean.document,
                        }));
                        setFormVisible(true);
                    }}>

                        <div className="flex justify-between gap-1 flex-wrap">
                            <p className="font-bold text-lg">{capitalize(student.name)}</p>
                            <p className="text-sm">{student.status}</p>
                        </div>
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

                        <p className="text-sm">Contato: {student.address.phone_home}</p>
                    </li>
                ))}
            </ul>
            <StudentTabForm form={form} onChange={handleChange} visible={formVisible} onVisibilityChanged={setFormVisible} onSubmit={handleSubmit} guardians={guardians} />

            <PageButton text="Cadastrar" icon={faUser} onClick={() => { setForm(new StudentForm()); setFormVisible(true) }} />
        </div>
    );
}
