"use client"
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import FormInput from "./FormInput";
import TabForm from "./TabForm";
import { studentBuildings, studentClassifications, studentColor, studentFloors, StudentForm, studentGender, studentHouses, studentMobility, studentRoofs, studentStatus } from "@/models/StudentForm";
import { faArrowDown19, faBowlFood, faBuilding, faCakeCandles, faCalendarDay, faCity, faClipboard, faDroplet, faFile, faFileDownload, faFileLines, faFileWord, faFlag, faFont, faHouse, faIdCard, faMoneyBill, faNotesMedical, faPalette, faPen, faPhone, faPhoneAlt, faPrint, faRoad, faSave, faTable, faTableList, faTrash, faUser, faUsers, faVenusMars, faVirus, faWheelchair } from "@fortawesome/free-solid-svg-icons";
import { prismaDate } from "@/lib/prismaLib";
import { Class, Guardian, Report } from "@prisma/client";
import FormButtonGroup from "./FormButtonGroup";
import FormButton from "./FormButton";
import Swal from "sweetalert2";
import { cleanObject, formatCurrency } from "@/lib/format";
import { useSession } from "next-auth/react";
import { ReportForm } from "@/models/ReportForm";
import Loader from "./Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { id } from "zod/locales";

type Props = {
    form: StudentForm;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    visible?: boolean;
    onVisibilityChanged: (visible: boolean) => void;
    onSubmit?: ((e: FormEvent<Element>) => void) | undefined
    onDelete?: (id: number) => void
    guardians?: Guardian[];
    classes?: Class[];
}

export default function StudentTabForm({ form, onChange, visible, onVisibilityChanged, onSubmit, onDelete, guardians = [], classes = [] }: Props) {
    const { data: session } = useSession();
    let tabs = ["Matrícula", "Saúde", "Auxílio", "Responsáveis", "Endereço", "Documentação", "Casa", "Bens", "Relatórios"]
    const [tab, setTab] = useState(tabs[0])
    const [word, setWord] = useState(false);
    const divStyle = "flex flex-col gap-2 sm:flex-row";
    const guardianOptions = guardians.map(g => [g.id, g.name]) as [number, string][];
    const classOptions = classes.map(c => [c.id, `Grade: ${c.grade} Ano: ${c.year}`]) as [number, string][];
    const [reports, setReports] = useState<Report[]>([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportForm, setReportForm] = useState<ReportForm>(new ReportForm());



    async function fetchReports() {
        try {
            setReportsLoading(true);
            const res = await fetch(`/api/report?id=${form.id}`);
            const data = await res.json();
            if (res.ok) {
                setReports(data);
                if (reportForm.id > -1) {
                    const report = data.find((r: Report) => r.id == reportForm.id);
                    setReportForm(new ReportForm(cleanObject(report)))
                }
            }
        }
        catch (error) {
            console.error("Erro ao buscar relatórios:", error);
            setReports([]);
        }
        finally { setReportsLoading(false); }
    }
    useEffect(() => { fetchReports(); }, [visible])
    function handleReportChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { id, value } = event.target;
        setReportForm(prev => new ReportForm({ ...prev, [id]: value }));
    }

    async function handleSubmitReport(event: React.FormEvent) {
        event.preventDefault();
        const message = reportForm.verify()
        if (message) return Swal.fire({
            title: "Erro de validação",
            html: message,
            icon: "error"
        });
        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reportForm.getData())
            })
            const data = await res.json();
            if (!res.ok) throw data.error;
            fetchReports();
            if (reportForm.id == -1) setReportVisible(false);
            Swal.fire({
                title: `Relatório ${reportForm.id == -1 ? "criado" : "atualizado"} com sucesso`,
                icon: "success"
            });

        }
        catch (error) {
            return Swal.fire({
                title: `Erro na ${reportForm.id == -1 ? "criação" : "atualização"}`,
                text: String(error),
                icon: "error"
            });
        }
    }
    async function handleDeleteReport(report: Report) {
        Swal.fire({
            title: `Tem certeza que deseja deletar o relatório ${report.title}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await fetch("/api/report", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: report.id, student_id: form.id })
                })
                const data = await res.json();
                if (!res.ok) throw data.error;
                fetchReports();
                Swal.fire({
                    title: "Relatório deletado com sucesso",
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
        })
    }
    async function handlePrint() {
        setWord(true);
        //if (onSubmit && form.id != -1) { await onSubmit(new Event("submit") as unknown as FormEvent<Element>); }
        const res = await fetch("/api/export-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: form.id }),
        });

        if (!res.ok) {
            Swal.fire({
                title: "Erro ao gerar documento",
                icon: "error"
            })
            setWord(false);
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Ficha_${form.name}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setWord(false);
    };
    function downloadBase64(base64: string, filename: string) {
        const link = document.createElement("a");
        link.href = base64;
        link.download = filename;
        link.click();
    }

    const ReportTab = (
        <div className="flex flex-col w-full justify-center gap-2">
            <ul className="flex flex-col gap-2 p-2 rounded-lg bg-background-darker">
                <p className="text-primary font-bold mx-auto">{reports.length > 0 ? "Relatórios" : "Nenhum Relatório salvo"}</p>
                {reportsLoading ? (
                    <div className="flex justify-center">
                        <Loader />
                    </div>
                ) : reports.map(report => (
                    <li className="flex gap-1 items-center" key={report.id}>
                        <div className="flex flex-col md:flex-row w-full gap-0.5 md:gap-1 bg-primary text-white p-2 rounded-md">
                            <div className="flex gap-1 justify-between md:flex-row-reverse">
                                <p className="font-bold">{report.title + ":"}</p>
                                <p className="font-bold text-black opacity-50">
                                    {prismaDate(report.date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                                </p>
                            </div>
                            {report.description}
                        </div>
                        <FontAwesomeIcon
                            icon={faPen}
                            className="text-primary-darker text-xl hover:text-primary transition"
                            onClick={() => {
                                setReportForm(new ReportForm(cleanObject(report)));
                                setReportVisible(true);
                            }}
                        />
                        <FontAwesomeIcon
                            icon={faTrash}
                            className="text-primary-darker text-xl hover:text-red-500 transition"
                            onClick={() => handleDeleteReport(report)}
                        />
                        {(() => {
                            const file = report.file as { base64: string; name: string } | null;

                            return file?.base64 ? (
                                <FontAwesomeIcon
                                    icon={faFileDownload}
                                    className="text-primary-darker text-xl hover:text-primary transition"
                                    onClick={() => downloadBase64(file.base64, file.name)}
                                />
                            ) : null;
                        })()}

                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="bg-primary-darker text-white mx-auto px-2 py-1 rounded-md hover:scale-105 transition"
                onClick={() => {
                    setReportForm(new ReportForm({ student_id: form.id }))
                    setReportVisible(true);
                }}
            >
                Adicionar Relatório
            </button>
        </div>
    )
    const ReportTabForm = (
        <TabForm
            visible={reportVisible}
            onCancel={() => { setReportVisible(false); }}
            onSubmit={handleSubmitReport}
            submit={reportForm.id == -1 ? "Criar" : "Atualizar"}
            submitIcon={faClipboard}
        >
            <div className="flex gap-2">
                <FormInput id="title" icon={faFont} label="Titulo" onChange={handleReportChange} value={reportForm.title} fullWidth />
                <FormInput
                    id="date"
                    icon={faCalendarDay}
                    label="Data"
                    onChange={handleReportChange}
                    type="date"
                    value={prismaDate(reportForm.date).toISOString().split("T")[0]}
                />
            </div>
            <div className="flex gap-2">
                <FormInput id="description" icon={faTableList} label="Descrição" onChange={handleReportChange} type="textarea" value={reportForm.description} fullWidth />
                <FormInput id="file" label="Arquivo" icon={faFileLines} onChange={handleReportChange} type="file" value={reportForm.file} />
            </div>
        </TabForm>
    );
    if (form.id == -1) { tabs.filter(t => t != "Relatórios") }
    if (!session) { return null }
    else if (session.user.level > 2) {
        tabs = ["Matrícula", "Saúde", "Responsáveis", "Endereço", "Relatórios"];
        if (!tabs.includes(tab)) { setTab(tabs[0]); }
        return (
            <>
                <TabForm visible={visible} tabs={tabs} tab={tab} onTabChanged={setTab} onCancel={() => onVisibilityChanged(false)} >
                    {tab == "Matrícula" ? (
                        <>
                            <FormInput id="name" label="Nome" icon={faFont} value={form.name} onChange={onChange} disabled />
                            <FormInput
                                id="birthday"
                                type="date"
                                label="Data de nascimento"
                                icon={faCakeCandles}
                                value={form.birthday ? prismaDate(form.birthday).toISOString().substring(0, 10) : ""}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput id="gender" label="Sexo" icon={faVenusMars} value={form.gender} options={studentGender} onChange={onChange} disabled />
                            <FormInput
                                id="color"
                                label="Cor/Raça"
                                icon={faPalette}
                                options={studentColor}
                                value={form.color}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput
                                id="class_id"
                                label="Turma"
                                icon={faUsers}
                                options={classOptions}
                                search
                                value={form.class_id}
                                onChange={onChange}
                                disabled
                            />
                            <div className="flex justify-center gap-2">
                                <FormInput id="twins" label="Gêmeos" icon={faUser} value={form.twins} onChange={onChange} disabled />
                                <FormInput id="has_siblings" label="Irmãos" icon={faUser} value={form.has_siblings} onChange={onChange} disabled />
                            </div>
                        </>
                    ) : tab == "Saúde" ? (
                        <>
                            <FormInput
                                id="sus"
                                label="SUS"
                                icon={faUser}
                                value={form.sus}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput id="health_issues" label="Problemas de Saúde" icon={faNotesMedical} value={form.health_issues} onChange={onChange} disabled />
                            <FormInput id="food_restriction" label="Restrição Alimentar" icon={faBowlFood} value={form.food_restriction} onChange={onChange} disabled />
                            <FormInput id="allergy" label="Alergia" icon={faVirus} value={form.allergy} onChange={onChange} disabled />
                            <FormInput id="mobility" label="Mobilidade Reduzida" options={studentMobility} icon={faWheelchair} value={form.mobility} onChange={onChange} disabled />
                            <FormInput id="disabilities" label="Possui Deficiências Múltiplas" icon={faNotesMedical} value={form.disabilities} onChange={onChange} disabled />
                            <FormInput id="special_needs" label="Criança Público Alvo de Educação Especial" icon={faNotesMedical} value={form.special_needs} onChange={onChange} disabled />
                            <FormInput id="classification" label="Classificação" icon={faNotesMedical} options={studentClassifications} value={form.special_needs} onChange={onChange} disabled />
                        </>
                    ) : tab == "Responsáveis" ? (
                        <>
                            <FormInput
                                id="dad_id"
                                label="Pai"
                                icon={faUser}
                                options={guardianOptions}
                                search
                                value={form.dad_id}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput
                                id="mom_id"
                                label="Mãe"
                                icon={faUser}
                                options={guardianOptions}
                                search
                                value={form.mom_id}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput
                                id="guardian_id"
                                label="Responsável"
                                icon={faUser}
                                options={guardianOptions}
                                search
                                value={form.guardian_id}
                                onChange={onChange}
                                disabled
                            />
                            <FormInput
                                id="authorized"
                                label="Pessoas autorizadas a retirar a criança da escola"
                                icon={faUser}
                                value={form.authorized}
                                onChange={onChange}
                                disabled
                            />
                        </>
                    ) : tab == "Endereço" ? (
                        <>
                            <div className="flex gap-2">
                                <FormInput id="street" label="Rua" icon={faRoad} value={form.street} onChange={onChange} disabled />
                                <FormInput id="number" label="Número" icon={faHouse} value={form.number} onChange={onChange} disabled />
                                <FormInput id="neighborhood" label="Bairro" icon={faHouse} value={form.neighborhood} onChange={onChange} disabled />
                            </div>
                            <div className="flex gap-2">
                                <FormInput id="city" label="Município" icon={faCity} value={form.city} onChange={onChange} fullWidth disabled />
                                <FormInput id="state" label="UF" icon={faFlag} value={form.state} onChange={onChange} disabled />
                            </div>
                            <FormInput id="reference" label="Pontos de Referência" icon={faHouse} value={form.reference} onChange={onChange} disabled />
                            <FormInput id="cep" label="CEP" icon={faHouse} value={form.cep} onChange={onChange} disabled />
                            <div className={divStyle}>
                                <FormInput id="phone_home" label="Contato" icon={faPhone} value={form.phone_home} onChange={onChange} fullWidth disabled />
                                <FormInput id="phone_alt" label="Outro contato" icon={faPhone} value={form.phone_alt} onChange={onChange} fullWidth disabled />
                            </div>
                        </>
                    ) : ReportTab}
                </TabForm>
                {ReportTabForm}
            </>
        )
    }
    if (!tabs.includes(tab)) { setTab(tabs[0]); }
    return (
        <>
            <TabForm visible={visible} tabs={tabs} tab={tab} onTabChanged={setTab} onCancel={() => onVisibilityChanged(false)} onSubmit={onSubmit}>
                <FormButtonGroup>
                    {form.id > -1 && (<FormButton color="bg-red-400" icon={faTrash} onClick={() => onDelete && onDelete(form.id)} />)}
                    <FormButton color="bg-yellow-600" icon={faFileWord} onClick={handlePrint} loading={word} />
                    <FormButton submit text={form.id == -1 ? "Cadastrar" : "Atualizar"} icon={faSave} />
                </FormButtonGroup>
                {tab == "Matrícula" ? (
                    <>
                        <FormInput id="status" label="Estado da matrícula" icon={faFile} value={form.status} options={studentStatus} onChange={onChange} />
                        <FormInput id="name" label="Nome" icon={faFont} value={form.name} onChange={onChange} />
                        <FormInput
                            id="birthday"
                            type="date"
                            label="Data de nascimento"
                            icon={faCakeCandles}
                            value={form.birthday ? prismaDate(form.birthday).toISOString().substring(0, 10) : ""}
                            onChange={onChange}
                        />
                        <FormInput id="gender" label="Sexo" icon={faVenusMars} value={form.gender} options={studentGender} onChange={onChange} />
                        <FormInput
                            id="color"
                            label="Cor/Raça"
                            icon={faPalette}
                            options={studentColor}
                            value={form.color}
                            onChange={onChange}
                        />
                        <FormInput
                            id="class_id"
                            label="Turma"
                            icon={faUsers}
                            options={classOptions}
                            search
                            value={form.class_id}
                            onChange={onChange}
                        />
                        <div className="flex justify-center gap-2">
                            <FormInput id="twins" label="Gêmeos" icon={faUser} value={form.twins} onChange={onChange} />
                            <FormInput id="has_siblings" label="Irmãos" icon={faUser} value={form.has_siblings} onChange={onChange} />
                        </div>
                    </>
                ) : tab == "Saúde" ? (
                    <>
                        <FormInput
                            id="sus"
                            label="SUS"
                            icon={faUser}
                            value={form.sus}
                            onChange={onChange}
                        />
                        <FormInput id="health_issues" label="Problemas de Saúde" icon={faNotesMedical} value={form.health_issues} onChange={onChange} />
                        <FormInput id="food_restriction" label="Restrição Alimentar" icon={faBowlFood} value={form.food_restriction} onChange={onChange} />
                        <FormInput id="allergy" label="Alergia" icon={faVirus} value={form.allergy} onChange={onChange} />
                        <FormInput id="mobility" label="Mobilidade Reduzida" options={studentMobility} icon={faWheelchair} value={form.mobility} onChange={onChange} />
                        <FormInput id="disabilities" label="Possui Deficiências Múltiplas" icon={faNotesMedical} value={form.disabilities} onChange={onChange} />
                        <FormInput id="special_needs" label="Criança Público Alvo de Educação Especial" icon={faNotesMedical} value={form.special_needs} onChange={onChange} />
                        <FormInput id="classification" label="Classificação" icon={faNotesMedical} options={studentClassifications} value={form.special_needs} onChange={onChange} />
                    </>
                ) : tab == "Auxílio" ? (
                    <>
                        <FormInput id="gov_aid" label="O Responsável é Beneficiário do Governo" icon={faFile} value={form.gov_aid} onChange={onChange} />
                        <FormInput id="nis_number" label="Número do NIS" icon={faArrowDown19} value={form.nis_number} onChange={onChange} />
                    </>
                ) : tab == "Responsáveis" ? (
                    <>
                        <FormInput
                            id="dad_id"
                            label="Pai"
                            icon={faUser}
                            options={guardianOptions}
                            search
                            value={form.dad_id}
                            onChange={onChange}
                        />
                        <FormInput
                            id="mom_id"
                            label="Mãe"
                            icon={faUser}
                            options={guardianOptions}
                            search
                            value={form.mom_id}
                            onChange={onChange}
                        />
                        <FormInput
                            id="guardian_id"
                            label="Responsável"
                            icon={faUser}
                            options={guardianOptions}
                            search
                            value={form.guardian_id}
                            onChange={onChange}
                        />
                        <FormInput
                            id="family"
                            label="Composição Familiar"
                            icon={faUser}
                            value={form.family}
                            onChange={onChange}
                        />

                        <div className="grid grid-cols-2 mt-2 text-primary text-sm text-center">
                            <h1>Renda familiar total: <strong>{formatCurrency(form.getTotal())}</strong></h1>
                            <h1>Renda per capita: <strong>{formatCurrency(form.getPerCapta())}</strong></h1>
                        </div>

                        <FormInput
                            id="authorized"
                            label="Pessoas autorizadas a retirar a criança da escola"
                            icon={faUser}
                            value={form.authorized}
                            onChange={onChange}
                        />
                    </>
                ) : tab == "Endereço" ? (
                    <>
                        <div className="flex gap-2">
                            <FormInput id="street" label="Rua" icon={faRoad} value={form.street} onChange={onChange} />
                            <FormInput id="number" label="Número" icon={faHouse} value={form.number} onChange={onChange} />
                            <FormInput id="neighborhood" label="Bairro" icon={faHouse} value={form.neighborhood} onChange={onChange} />
                        </div>
                        <div className="flex gap-2">
                            <FormInput id="city" label="Município" icon={faCity} value={form.city} onChange={onChange} fullWidth />
                            <FormInput id="state" label="UF" icon={faFlag} value={form.state} onChange={onChange} />
                        </div>
                        <FormInput id="reference" label="Pontos de Referência" icon={faHouse} value={form.reference} onChange={onChange} />
                        <FormInput id="cep" label="CEP" icon={faHouse} value={form.cep} onChange={onChange} />
                        <div className={divStyle}>
                            <FormInput id="phone_home" label="Contato" icon={faPhone} value={form.phone_home} onChange={onChange} fullWidth />
                            <FormInput id="phone_alt" label="Outro contato" icon={faPhone} value={form.phone_alt} onChange={onChange} fullWidth />
                        </div>
                    </>
                ) : tab == "Documentação" ? (
                    <>
                        <div className={divStyle}>
                            <FormInput id="birth_cert" label="Certidão de Nascimento Nº" icon={faIdCard} value={form.birth_cert} onChange={onChange} fullWidth />
                            <FormInput id="birth_city" label="Município de Nascimento" icon={faIdCard} value={form.birth_city} onChange={onChange} fullWidth />
                        </div>
                        <div className={divStyle}>
                            <FormInput id="registry_city" label="Município de Registro" icon={faCity} value={form.registry_city} onChange={onChange} fullWidth />
                            <FormInput id="registry_office" label="Cartório de Registro" icon={faBuilding} value={form.street} onChange={onChange} fullWidth />
                        </div>
                        <FormInput id="cpf" label="CPF" icon={faIdCard} value={form.cpf} onChange={onChange} />
                        <div className={divStyle}>
                            <FormInput id="rg" label="RG" icon={faIdCard} value={form.rg} onChange={onChange} />
                            <FormInput id="rg_issue_date" label="Data de Emissão" type="date" icon={faCalendarDay} value={form.rg_issue_date ? prismaDate(form.rg_issue_date).toISOString().substring(0, 10) : ""} onChange={onChange} />
                            <FormInput id="rg_issuer" label="Orgão Emissor" icon={faBuilding} value={form.rg_issuer} onChange={onChange} />
                        </div>
                    </>
                ) : tab == "Casa" ? (
                    <>
                        <FormInput id="type" label="Casa" icon={faHouse} options={studentHouses} value={form.type} onChange={onChange} />
                        <FormInput id="rent_value" label="Valor do Aluguel" icon={faMoneyBill} type="number" value={form.rent_value} onChange={onChange} />
                        <FormInput id="rooms" label="Nº de Comodos" icon={faHouse} type="number" value={form.rooms} onChange={onChange} />
                        <div className={divStyle}>
                            <FormInput id="floor_type" label="Tipo de Piso" icon={faHouse} options={studentFloors} value={form.floor_type} onChange={onChange} fullWidth />
                            <FormInput id="building_type" label="Tipo de Moradia" icon={faHouse} options={studentBuildings} value={form.building_type} onChange={onChange} fullWidth />
                            <FormInput id="roof_type" label="Tipo de Cobertura" icon={faHouse} options={studentRoofs} value={form.building_type} onChange={onChange} fullWidth />
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <FormInput id="septic_tank" label="Fossa" icon={faDroplet} value={form.septic_tank} onChange={onChange} />
                            <FormInput id="cifon" label="Cifon" icon={faDroplet} value={form.cifon} onChange={onChange} />
                            <FormInput id="electricity" label="Energia Elétrica" icon={faUser} value={form.electricity} onChange={onChange} />
                            <FormInput id="water" label="Água Encanada" icon={faUser} value={form.water} onChange={onChange} />
                        </div>
                    </>
                ) : tab == "Bens" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                        <FormInput id="tv" label="TV" icon={faUser} value={form.tv} onChange={onChange} />
                        <FormInput id="dvd" label="DVD" icon={faUser} value={form.dvd} onChange={onChange} />
                        <FormInput id="radio" label="Rádio" icon={faUser} value={form.radio} onChange={onChange} />
                        <FormInput id="computer" label="Computador" icon={faUser} value={form.computer} onChange={onChange} />
                        <FormInput id="notebook" label="Notebook" icon={faUser} value={form.notebook} onChange={onChange} />
                        <FormInput id="phone_fixed" label="Telefone Fixo" icon={faUser} value={form.phone_fixed} onChange={onChange} />
                        <FormInput id="phone_mobile" label="Telefone Celular" icon={faUser} value={form.phone_mobile} onChange={onChange} />
                        <FormInput id="tablet" label="Tablet" icon={faUser} value={form.tablet} onChange={onChange} />
                        <FormInput id="internet" label="Internet" icon={faUser} value={form.internet} onChange={onChange} />
                        <FormInput id="cable_tv" label="TV a cabo" icon={faUser} value={form.cable_tv} onChange={onChange} />
                        <FormInput id="stove" label="Fogão" icon={faUser} value={form.stove} onChange={onChange} />
                        <FormInput id="fridge" label="Geladeira" icon={faUser} value={form.fridge} onChange={onChange} />
                        <FormInput id="freezer" label="Freezer" icon={faUser} value={form.freezer} onChange={onChange} />
                        <FormInput id="microwave" label="Micro-ondas" icon={faUser} value={form.microwave} onChange={onChange} />
                        <FormInput id="washing_machine" label="Máquina de lavar" icon={faUser} value={form.washing_machine} onChange={onChange} />
                        <FormInput id="air_conditioner" label="Ar Condicionado" icon={faUser} value={form.air_conditioner} onChange={onChange} />
                        <FormInput id="bicycle" label="Bicicleta" icon={faUser} value={form.bicycle} onChange={onChange} />
                        <FormInput id="motorcycle" label="Moto" icon={faUser} value={form.motorcycle} onChange={onChange} />
                        <FormInput id="car" label="Carro" icon={faUser} value={form.car} onChange={onChange} />
                    </div>
                ) : ReportTab}
            </TabForm>
            {ReportTabForm}
        </>
    )
}