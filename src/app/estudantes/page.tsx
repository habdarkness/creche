"use client";

import { capitalize, cleanObject, getAge } from "@/lib/format";
import { ClassWithRelations, GuardianWithRelations, StudentWithRelations, UserWithRelations } from "@/types/prismaTypes";
import { faFileExcel, faGraduationCap, faPen, faSave, faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { StudentForm } from "../../models/StudentForm";
import { prismaDate } from "@/lib/prismaLib";
import StudentTabForm from "@/components/StudentTabForm";
import { useSearch } from "@/components/Contexts";
import Card from "@/components/Card";
import CardList from "@/components/CardList";
import { useSession } from "next-auth/react";
import PageMenu from "@/components/PageMenu";
import PageLayout from "@/components/PageLayout";
import { ClassForm } from "@/models/ClassForm";
import TabForm from "@/components/TabForm";
import FormInput from "@/components/FormInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormButtonGroup from "@/components/FormButtonGroup";
import FormButton from "@/components/FormButton";
import matches from "@/lib/matches";

export default function Students() {
    const { data: session, status } = useSession();
    const { filters, search } = useSearch();
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [guardians, setGuardians] = useState<GuardianWithRelations[]>([]);
    const [classes, setClasses] = useState<ClassWithRelations[]>([]);
    const [users, setUsers] = useState<UserWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [formIndex, setFormIndex] = useState(-1);
    const [form, setForm] = useState<StudentForm>(new StudentForm());
    const [classForm, setClassForm] = useState<ClassForm>(new ClassForm());
    const [exporting, setExporting] = useState(false);

    async function fetchAll() {
        try {
            if (formIndex == -1) { setLoading(true) }
            const resStudent = await fetch("/api/student");
            const dataStudent = await resStudent.json();
            if (resStudent.ok) {
                setStudents(dataStudent);
                if (form.id > -1) {
                    const student = dataStudent.find((s: StudentWithRelations) => s.id == form.id);
                    const clean = cleanObject(student)
                    setForm(new StudentForm({
                        ...clean.address,
                        ...clean.housing,
                        ...clean.asset,
                        ...clean.document,
                        ...clean,
                    }));
                }
            }
            const resGuardian = await fetch("/api/guardian");
            const dataGuardian = await resGuardian.json();
            if (resGuardian.ok) { setGuardians(dataGuardian); }

            const resClass = await fetch("/api/class");
            const dataClass = await resClass.json();
            if (resClass.ok) { setClasses(dataClass); }

            const resUsers = await fetch("/api/user");
            const dataUsers = await resUsers.json();
            if (resUsers.ok) {
                setUsers(dataUsers);
                if (classForm.id > -1) {
                    const studentClass = dataStudent.find((c: ClassWithRelations) => c.id == classForm.id);
                    const clean = cleanObject(studentClass);
                    setClassForm(new ClassForm(clean));
                }
            }
        }
        catch (error) { console.error("Erro ao buscar estudantes:", error); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchAll(); }, []);
    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setForm(prev => new StudentForm({
            ...prev,
            [id]: id === "birthday"
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
            if (form.id == -1) { setFormIndex(-1) }
            if (!res.ok) throw data.error;
            fetchAll();
            Swal.fire({
                title: `Estudante ${form.id == -1 ? "cadastrado" : "atualizado"} com sucesso!`,
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
    function handleChangeClass(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setClassForm(prev => new ClassForm({
            ...prev,
            [id]: value
        }));
    }
    async function handleDelete(id: number) {
        const student = students.find(s => s.id == id);
        Swal.fire({
            title: `Tem certeza que deseja deletar o estudante ${student && `${student.name} (${getAge(student.birthday)})`}`,
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
                setForm(new StudentForm());
                setFormIndex(-1);
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
    async function handleExport(ids: number[]) {
        if (exporting) { return }
        try {
            setExporting(true);
            const res = await fetch("/api/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            })
            if (!res.ok) throw (await res.json()).error;
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dados.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            Swal.fire({
                title: "Dados exportados com sucesso",
                icon: "success"
            });
        }
        catch (error) {
            return Swal.fire({
                title: "Erro ao exportar",
                text: String(error),
                icon: "error"
            });
        }
        finally { setExporting(false); }
    }
    async function handleSubmitClass(event: React.FormEvent) {
        event.preventDefault();
        const message = classForm.verify()
        if (message) return Swal.fire({
            title: "Erro de validação",
            html: message,
            icon: "error"
        });
        try {
            const res = await fetch("/api/class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(classForm.getData())
            })
            if (classForm.id == -1) setFormIndex(-1);
            const data = await res.json();
            if (!res.ok) throw data.error;
            fetchAll();
            Swal.fire({
                title: `Turma ${classForm.id == -1 ? "criada" : "atualizada"} com sucesso`,
                icon: "success"
            });
        }
        catch (error) {
            return Swal.fire({
                title: `Erro ${form.id == -1 ? "na criação" : "na atualização"}`,
                text: String(error),
                icon: "error"
            });
        }
    }
    async function handleDeleteClass(id: number) {
        const studentClass = classes.find(c => c.id == id);
        Swal.fire({
            title: `Tem certeza que deseja deletar a turma ${studentClass && `grade: ${studentClass.grade} ano ${studentClass.year}`}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch("/api/class", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                fetchAll();
                Swal.fire({
                    title: "Turma deletada com sucesso",
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
    const filtered = students.filter(student => {
        const clean = cleanObject(student)
        return matches(new StudentForm({
            ...clean.address,
            ...clean.housing,
            ...clean.asset,
            ...clean.document,
            ...clean,
        }).getFiltered(), search, filters);
    });

    const organized = filtered.reduce((acc, student) => {
        const class_id = student.class_id ?? -1;
        if (!acc[class_id]) {
            acc[class_id] = [];
        }
        acc[class_id].push(student);
        return acc;
    }, {} as Record<number, StudentWithRelations[]>);
    classes.forEach(c => { if (!organized[c.id]) { organized[c.id] = [] } })

    return (
        <PageLayout title="Estudantes" loading={loading}>
            {Object.entries(organized).map(([id, class_students]) => {
                const c = classes.find(c => c.id == Number(id));
                return (
                    <div key={id} className="flex flex-col bg-background p-2 rounded-2xl gap-2">
                        <div className="flex gap-2 px-2 w-full text-lg font-bold items-center">
                            {c ? (
                                <div className="flex w-full justify-center gap-4">
                                    <p>Grade: {c.grade}</p>
                                    <p>Ano: {c.year}</p>
                                </div>
                            ) : (
                                <p className="flex w-full justify-center text-center">Sem turma</p>
                            )}
                            {session && session.user.id < 2 && c && (
                                <>
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className="text-primary hover:scale-125 transition"
                                        onClick={() => {
                                            setClassForm(new ClassForm(cleanObject(c)));
                                            setFormIndex(1);
                                        }}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-red-400 hover:scale-125 transition"
                                        onClick={() => handleDeleteClass(c.id)}
                                    />
                                </>
                            )}
                        </div>
                        {class_students.length > 0 && (
                            <div className="p-2 bg-background-darker rounded-xl">
                                <CardList>
                                    {class_students.map(student => (
                                        <Card key={student.id} pressable disabled={student.status != "Matriculado"} onClick={() => {
                                            const clean = cleanObject(student)
                                            setForm(new StudentForm({
                                                ...clean.address,
                                                ...clean.housing,
                                                ...clean.asset,
                                                ...clean.document,
                                                ...clean,
                                            }));
                                            setFormIndex(0);
                                        }}>

                                            <div className="flex justify-between gap-1 flex-wrap">
                                                <p className="font-bold text-lg">{capitalize(student.name)}</p>
                                                <p className="text-sm font-bold text-black opacity-50">{student.status}</p>
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
                                        </Card>
                                    ))}
                                </CardList>
                            </div>
                        )}
                    </div>
                )
            })}

            <StudentTabForm
                form={form}
                onChange={handleChange}
                visible={formIndex == 0}
                onVisibilityChanged={(visible) => setFormIndex(visible ? 0 : -1)}
                onSubmit={handleSubmit} onDelete={handleDelete}
                guardians={guardians} classes={classes}
            />
            <TabForm
                visible={formIndex == 1}
                onSubmit={handleSubmitClass}
                onCancel={() => setFormIndex(-1)}
            >
                <div className="flex gap-2">
                    <FormInput id="grade" label="Grade" value={classForm.grade} onChange={handleChangeClass} fullWidth />
                    <FormInput id="year" label="Ano" value={classForm.year} onChange={handleChangeClass} fullWidth />
                </div>
                <FormInput
                    id="professor_id"
                    label="Professor"
                    options={users.filter(u => u.type === "Professor").map(u => [u.id, u.name]) as [number, string][]}
                    value={classForm.professor_id as number}
                    onChange={handleChangeClass}
                    search
                />
                <FormButtonGroup>
                    {classForm.id > -1 && (<FormButton color="bg-red-400" icon={faTrash} onClick={() => handleDeleteClass(classForm.id)} />)}
                    <FormButton submit text={classForm.id == -1 ? "Cadastrar" : "Atualizar"} icon={faSave} />
                </FormButtonGroup>
            </TabForm>
            {status == "authenticated" && session.user.level < 3 && (
                <PageMenu
                    options={{ "Cadastrar estudante": faGraduationCap, "Cadastrar turma": faUsers, "Exportar dados": faFileExcel }}
                    onSelect={(index) => {
                        setForm(new StudentForm());
                        setClassForm(new ClassForm());
                        if (index == 2) {
                            const ids = filtered.map(s => s.id);
                            handleExport(ids)
                        }
                        else setFormIndex(index);
                    }}
                />
            )}
        </PageLayout>
    );
}
