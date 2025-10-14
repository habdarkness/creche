"use client";

import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import PageButton from "@/components/PageButton";
import TabForm from "@/components/TabForm";
import { capitalize, cleanObject } from "@/lib/format";
import { StudentWithRelations } from "@/types/prismaTypes";
import { faCakeCandles, faUser, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {studentBuildings, studentClassifications, studentFloors, StudentForm, studentHouses, studentMobility, studentRoofs, studentStatus } from "../../models/StudentForm";
import { Guardian } from "@prisma/client";
import { prismaDate } from "@/lib/prismaLib";
export default function Students() {
    const tabs = ["Matrícula", "Saúde", "Auxílio", "Responsáveis", "Endereço", "Documentação", "Casa", "Bens"]
    const [tab, setTab] = useState(tabs[0])
    const [students, setStudents] = useState<StudentWithRelations[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState<StudentForm>(new StudentForm());
    
    const divStyle = "flex flex-col gap-2 sm:flex-row";

    useEffect(() => {
        async function fetchStudents() {
            try {
                setLoading(true);
                const resStudent = await fetch("/api/student");
                const dataStudent = await resStudent.json();
                setStudents(dataStudent);

                const resGuardian = await fetch("/api/guardian");
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
        console.log(form.getData())
        const message = form.verify()
        if (message) return Swal.fire({
            title: "Erro de validação",
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
    if (loading) return (<div className="flex items-center justify-center h-full"><Loader /></div>)
    return (
        <div className="flex flex-col m-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Estudantes</h1>
            <ul className=" grid grid-cols-4 w-full gap-4">
                {false && students.map(student => (
                    <li key={student.id} className="flex flex-col  bg-primary-darker p-2 rounded-2xl hover:scale-105 transition" onClick={() => {
                        setForm(new StudentForm(cleanObject(student)));
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
            <TabForm visible={formVisible} tabs={tabs} tab={tab} onTabChanged={setTab} onCancel={() => setFormVisible(false)} onSubmit={handleSubmit} submit={form.id == -1 ? "Cadastrar" : "Atualizar"}>
                {tab == "Matrícula" ? (
                    <>
                        <FormInput id="status" label="Estado da matrícula" icon={faUser} value={form.status} options={studentStatus} onChange={handleChange} />
                        <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={handleChange} />
                        <FormInput
                            id="birthday"
                            type="date"
                            label="Aniversário"
                            icon={faCakeCandles}
                            value={form.birthday ? prismaDate(form.birthday).toISOString().substring(0, 10) : ""}
                            onChange={handleChange}
                        />
                        <FormInput id="gender" label="Sexo" icon={faVenusMars} value={form.gender} onChange={handleChange} />
                        <FormInput id="color" label="Cor/Raça" icon={faUser} value={form.color} onChange={handleChange} />
                        <div className="flex justify-center gap-2">
                            <FormInput id="twins" label="Gêmeos" icon={faUser} value={form.twins} onChange={handleChange} />
                            <FormInput id="has_brothers" label="Irmãos" icon={faUser} value={form.has_brothers} onChange={handleChange} />
                        </div>
                    </>
                ) : tab == "Saúde" ? (
                    <>
                        <FormInput
                            id="sus"
                            label="SUS"
                            icon={faUser}
                            value={form.sus}
                            onChange={handleChange}
                        />
                        <FormInput id="health_issues" label="Problemas de Saúde" icon={faUser} value={form.health_issues} onChange={handleChange} />
                        <FormInput id="food_restriction" label="Restrição Alimentar" icon={faUser} value={form.food_restriction} onChange={handleChange} />
                        <FormInput id="allergy" label="Alergia" icon={faUser} value={form.allergy} onChange={handleChange} />
                        <FormInput id="mobility" label="Mobilidade Reduzida" options={studentMobility} icon={faUser} value={form.mobility} onChange={handleChange} />
                        <FormInput id="disabilities" label="Possui Deficiências Múltiplas" icon={faUser} value={form.disabilities} onChange={handleChange} />
                        <FormInput id="special_needs" label="Criança Público Alvo de Educação Especial" icon={faUser} value={form.special_needs} onChange={handleChange} />
                        <FormInput id="classification" label="Classificação" icon={faUser} options={studentClassifications} value={form.special_needs} onChange={handleChange} />
                    </>
                ) : tab == "Auxílio" ? (
                    <>
                        <FormInput id="gov_aid" label="O Responsável é Beneficiário do Governo" icon={faUser} value={form.gov_aid} onChange={handleChange} />
                        <FormInput id="nis_number" label="Número do NIS" icon={faUser} value={form.nis_number} onChange={handleChange} />
                    </>
                ) : tab == "Responsáveis" ? (
                    <>
                        <FormInput
                            id="family"
                            label="Composição Familiar"
                            icon={faUser}
                            value={form.family}
                            onChange={handleChange}
                        />
                        <FormInput
                            id="authorized"
                            label="Pessoas autorizadas a retirar a criança da escola"
                            icon={faUser}
                            value={form.authorized}
                            onChange={handleChange}
                        />
                    </>
                ) : tab == "Endereço" ? (
                    <>
                        <div className="flex gap-2">
                            <FormInput id="street" label="Rua" icon={faUser} value={form.street} onChange={handleChange} />
                            <FormInput id="number" label="Número" icon={faUser} value={form.number} onChange={handleChange} />
                            <FormInput id="neighborhood" label="Bairro" icon={faUser} value={form.neighborhood} onChange={handleChange} />
                        </div>
                        <div className="flex gap-2">
                            <FormInput id="city" label="Município" icon={faUser} value={form.city} onChange={handleChange} fullWidth/>
                            <FormInput id="state" label="UF" icon={faUser} value={form.state} onChange={handleChange} />
                        </div>
                        <FormInput id="reference" label="Pontos de Referência" icon={faUser} value={form.reference} onChange={handleChange} />
                        <FormInput id="cep" label="CEP" icon={faUser} value={form.cep} onChange={handleChange} />
                        <div className={divStyle}>
                            <FormInput id="phone_home" label="Celular/Whatsapp" icon={faUser} value={form.phone_home} onChange={handleChange} fullWidth />
                            <FormInput id="phone_alt" label="Outro contato" icon={faUser} value={form.phone_alt} onChange={handleChange} fullWidth />
                        </div>
                    </>
                ) : tab == "Documentação" ? (
                    <>
                        <div className={divStyle}>
                            <FormInput id="birth_cert" label="Certidão de Nascimento Nº" icon={faUser} value={form.birth_cert} onChange={handleChange} fullWidth/>
                            <FormInput id="birth_city" label="Município de Nascimento" icon={faUser} value={form.birth_city} onChange={handleChange} fullWidth/>
                        </div>
                        <div className={divStyle}>
                            <FormInput id="registry_city" label="Município de Registro" icon={faUser} value={form.registry_city} onChange={handleChange} fullWidth/>
                            <FormInput id="registry_office" label="Cartório de Registro" icon={faUser} value={form.street} onChange={handleChange} fullWidth/>
                        </div>
                        <FormInput id="cpf" label="CPF" icon={faUser} value={form.cpf} onChange={handleChange} />
                        <div className={divStyle}>
                            <FormInput id="rg" label="RG" icon={faUser} value={form.rg} onChange={handleChange} />
                            <FormInput id="rg_issue_date" label="Data de Emissão" type="date" icon={faUser} value={form.rg_issue_date} onChange={handleChange} />
                            <FormInput id="rg_issuer" label="Orgão Emissor" icon={faUser} value={form.rg_issuer} onChange={handleChange} />
                        </div>
                    </>
                ) : tab == "Casa"? (
                    <>
                        <FormInput id="type" label="Casa" icon={faUser} options={studentHouses} value={form.type} onChange={handleChange} />
                        <FormInput id="rent_value" label="Valor do Aluguel" icon={faUser} type="number" value={form.rent_value} onChange={handleChange} />
                        <FormInput id="rooms" label="Nº de Comodos" icon={faUser} type="number" value={form.rooms} onChange={handleChange} />
                        <div className={divStyle}>
                            <FormInput id="floor_type" label="Tipo de Piso" icon={faUser} options={studentFloors} value={form.floor_type} onChange={handleChange} fullWidth />
                            <FormInput id="building_type" label="Tipo de Moradia" icon={faUser} options={studentBuildings} value={form.building_type} onChange={handleChange} fullWidth />
                            <FormInput id="roof_type" label="Tipo de Cobertura" icon={faUser} options={studentRoofs} value={form.building_type} onChange={handleChange} fullWidth />
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <FormInput id="sewer" label="Fossa" icon={faUser} value={form.sewer} onChange={handleChange} />
                            <FormInput id="septic_tank" label="Cifon" icon={faUser} value={form.septic_tank} onChange={handleChange} />
                            <FormInput id="electricity" label="Energia Elétrica" icon={faUser} value={form.electricity} onChange={handleChange} />
                            <FormInput id="water" label="Água Encanada" icon={faUser} value={form.water} onChange={handleChange} />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                        <FormInput id="tv" label="TV" icon={faUser} value={form.tv} onChange={handleChange} />
                        <FormInput id="dvd" label="DVD" icon={faUser} value={form.dvd} onChange={handleChange} />
                        <FormInput id="radio" label="Rádio" icon={faUser} value={form.radio} onChange={handleChange} />
                        <FormInput id="computer" label="Computador" icon={faUser} value={form.computer} onChange={handleChange} />
                        <FormInput id="notebook" label="Notebook" icon={faUser} value={form.notebook} onChange={handleChange} />
                        <FormInput id="phone_fixed" label="Telefone Fixo" icon={faUser} value={form.phone_fixed} onChange={handleChange} />
                        <FormInput id="phone_mobile" label="Telefone Celular" icon={faUser} value={form.phone_mobile} onChange={handleChange} />
                        <FormInput id="tablet" label="Tablet" icon={faUser} value={form.tablet} onChange={handleChange} />
                        <FormInput id="internet" label="Internet" icon={faUser} value={form.internet} onChange={handleChange} />
                        <FormInput id="cable_tv" label="TV a cabo" icon={faUser} value={form.cable_tv} onChange={handleChange} />
                        <FormInput id="stove" label="Fogão" icon={faUser} value={form.stove} onChange={handleChange} />
                        <FormInput id="fridge" label="Geladeira" icon={faUser} value={form.fridge} onChange={handleChange} />
                        <FormInput id="freezer" label="Freezer" icon={faUser} value={form.freezer} onChange={handleChange} />
                        <FormInput id="microwave" label="Micro-ondas" icon={faUser} value={form.microwave} onChange={handleChange} />
                        <FormInput id="washing_machine" label="Máquina de lavar" icon={faUser} value={form.washing_machine} onChange={handleChange} />
                        <FormInput id="air_conditioner" label="Ar Condicionado" icon={faUser} value={form.air_conditioner} onChange={handleChange} />
                        <FormInput id="bicycle" label="Bicicleta" icon={faUser} value={form.bicycle} onChange={handleChange} />
                        <FormInput id="motorcycle" label="Moto" icon={faUser} value={form.motorcycle} onChange={handleChange} />
                        <FormInput id="car" label="Carro" icon={faUser} value={form.car} onChange={handleChange} />
                    </div>
                )}


                {/* <FormInput id="guardian_id" options={[[-1, "Selecione um responsavel"], ...guardians.map((guardian): [number, string] => [guardian.id, guardian.name])]} label="Responsável" value={form.guardian_id} onChange={handleChange} /> */}
            </TabForm>
            <PageButton text="Cadastrar" icon={faUser} onClick={() => { setForm(new StudentForm()); setFormVisible(true) }} />
        </div>
    );
}
