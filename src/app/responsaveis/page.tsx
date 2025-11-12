"use client";

import Card from "@/components/Card";
import CardList from "@/components/CardList";
import { useSearch } from "@/components/Contexts";
import FormButton from "@/components/FormButton";
import FormButtonGroup from "@/components/FormButtonGroup";
import FormInput from "@/components/FormInput";
import PageLayout from "@/components/PageLayout";
import PageMenu from "@/components/PageMenu";
import StudentTabForm from "@/components/StudentTabForm";
import TabForm from "@/components/TabForm";
import { capitalize, cleanObject, formatPhone, formatRG, getAge } from "@/lib/format";
import { prismaDate } from "@/lib/prismaLib";
import { GuardianForm } from "@/models/GuardianForm";
import { StudentForm } from "@/models/StudentForm";
import { GuardianWithRelations, StudentWithRelations } from "@/types/prismaTypes";
import { faEnvelope, faSave, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { Student } from "@prisma/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Guardians() {
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [guardians, setGuardians] = useState<GuardianWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<GuardianForm>(new GuardianForm());
    const [studentFormVisible, setStudentFormVisible] = useState(false);
    const [studentForm, setStudentForm] = useState<StudentForm>(new StudentForm())
    const { search } = useSearch();

    async function fetchAll() {
        try {
            if (!formVisible && !studentFormVisible) setLoading(true);
            const resGuardian = await fetch("/api/guardian");
            const dataGuardian = await resGuardian.json();
            if (resGuardian.ok) {
                setGuardians(dataGuardian);
                if (form.id > -1) {
                    const guardian = dataGuardian.find((g: GuardianWithRelations) => g.id == form.id);
                    const clean = cleanObject(guardian)
                    setForm(new GuardianForm(clean));
                }
            }
            const resStudent = await fetch("/api/student");
            const dataStudent = await resStudent.json();
            if (resStudent.ok) {
                setStudents(dataStudent);
                if (studentForm.id > -1) {
                    const student = dataStudent.find((s: StudentWithRelations) => s.id == studentForm.id);
                    const clean = cleanObject(student)
                    setStudentForm(new StudentForm({
                        ...clean.address,
                        ...clean.housing,
                        ...clean.asset,
                        ...clean.document,
                        ...clean,
                    }));
                }
            }
        }
        catch (error) { console.error("Erro ao buscar estudantes:", error); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchAll(); }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new GuardianForm({ ...prev, [id]: value }));
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
            const res = await fetch("/api/guardian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            fetchAll();
            Swal.fire({
                title: `Usuário ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                icon: "success"
            });
            setForm(new GuardianForm());
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
        const guardian = guardians.find(g => g.id == id);
        Swal.fire({
            title: `Tem certeza que deseja deletar o responsável ${guardian && `${guardian.name} (${guardian.kinship})`}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch("/api/guardian", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                setForm(new GuardianForm());
                setStudentForm(new StudentForm());
                setFormVisible(false);
                setStudentFormVisible(false);
                fetchAll();
                Swal.fire({
                    title: "Responsável deletado com sucesso",
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
            const res = await fetch("/api/guardian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentForm.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            fetchAll();
            Swal.fire({
                title: `Estudante ${studentForm.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
                icon: "success"
            });
            setStudentForm(new StudentForm());
        }
        catch (error) {
            return Swal.fire({
                title: `Erro ${studentForm.id == -1 ? "no cadastrado" : "na atualização"}`,
                text: String(error),
                icon: "error"
            });
        }
    }
    async function handleDeleteStudent(id: number) {
        const student = students.find(s => s.id == id);
        Swal.fire({
            title: `Tem certeza que deseja deletar o etudante${student && `${student.name} (${getAge(student.birthday)}`})`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch("/api/student", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                setForm(new GuardianForm());
                setStudentForm(new StudentForm());
                setFormVisible(false);
                setStudentFormVisible(false);
                fetchAll();
                Swal.fire({
                    title: "Estudante deletado com sucesso",
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
    const filtered = guardians.filter(guardian => {
        if (!guardian) return false;
        const term = search.toLowerCase();
        const userTerm = (guardian.name).toLowerCase();
        return userTerm.includes(term);
    })
    return (
        <PageLayout title="Responsáveis" loading={loading}>
            <CardList>
                {filtered.map(guardian => (
                    <Card key={guardian.id} pressable onClick={() => {
                        setForm(new GuardianForm({ ...guardian }));
                        setFormVisible(true);
                    }}>
                        <div className="flex justify-between gap-1 flex-wrap mb-2">
                            <p className="font-bold text-lg">{capitalize(guardian.name)}</p>
                            <p className="text-sm font-bold text-black opacity-50">{capitalize(guardian.kinship)}</p>
                        </div>
                        <div className="flex justify-between gap-1 flex-wrap">
                            <p className="text-sm">RG: {formatRG(guardian.rg)}</p>
                            <p className="text-sm">Telefone: {formatPhone(guardian.phone)}</p>
                        </div>
                        <p className="text-sm">Alunos: {getStudents(guardian)}</p>
                    </Card>
                ))}
            </CardList>
            <TabForm visible={formVisible} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit} >
                <FormButtonGroup>
                    {form.id > -1 && (<FormButton color="bg-red-400" icon={faTrash} onClick={() => handleDelete(form.id)} />)}
                    <FormButton submit text={form.id == -1 ? "Cadastrar" : "Atualizar"} icon={faSave} />
                </FormButtonGroup>
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
                    <CardList>
                        {form.getStudents().map(guardian_student => {
                            const student = students.find(s => s.id == guardian_student.id);
                            if (!student) return;
                            return (
                                <Card key={student.id} pressable disabled={student.status != "Matriculado"} onClick={() => {
                                    const clean = cleanObject(student)
                                    setStudentForm(new StudentForm({
                                        ...clean.address,
                                        ...clean.housing,
                                        ...clean.asset,
                                        ...clean.document,
                                        ...clean,
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
                                </Card>
                            )
                        })}
                    </CardList>
                </div>
            </TabForm>
            <StudentTabForm
                form={studentForm}
                onChange={handleStudentChange}
                onSubmit={handleStudentSubmit}
                visible={studentFormVisible}
                onVisibilityChanged={setStudentFormVisible}
                guardians={guardians}
                onDelete={handleDeleteStudent}
            />
            <PageMenu options={{ "Cadastrar": faUser }} onSelect={(index) => { setForm(new GuardianForm()); setFormVisible(true); }} />
        </PageLayout>
    );
}

function getStudents(guardian: GuardianWithRelations): number {
    const allStudents = [...guardian.dad_of, ...guardian.mom_of, ...guardian.guardian_of];
    const uniqueMap = new Map<number, Student>();
    allStudents.forEach(student => {
        uniqueMap.set(student.id, student);
    })
    return uniqueMap.size;
}