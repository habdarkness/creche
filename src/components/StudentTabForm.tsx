"use client"
import { ChangeEvent, FormEvent, useState } from "react";
import FormInput from "./FormInput";
import TabForm from "./TabForm";
import { studentBuildings, studentClassifications, studentColor, studentFloors, StudentForm, studentHouses, studentMobility, studentRoofs, studentStatus } from "@/models/StudentForm";
import { faCakeCandles, faUser, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { prismaDate } from "@/lib/prismaLib";
import { Guardian } from "@prisma/client";

type Props = {
    form: StudentForm;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    visible?: boolean;
    onVisibilityChanged: (visible: boolean) => void;
    onSubmit?: ((e: FormEvent<Element>) => void) | undefined
    guardians?: Guardian[];
}

export default function StudentTabForm({ form, onChange, visible, onVisibilityChanged, onSubmit, guardians = [] }: Props) {
    const tabs = ["Matrícula", "Saúde", "Auxílio", "Responsáveis", "Endereço", "Documentação", "Casa", "Bens"]
    const [tab, setTab] = useState(tabs[0])

    const divStyle = "flex flex-col gap-2 sm:flex-row";
    const guardianOptions = guardians.map(guardian => [guardian.id, guardian.name]) as [number, string][];

    return (
        <TabForm visible={visible} tabs={tabs} tab={tab} onTabChanged={setTab} onCancel={() => onVisibilityChanged(false)} onSubmit={onSubmit} submit={form.id == -1 ? "Cadastrar" : "Atualizar"}>
            {tab == "Matrícula" ? (
                <>
                    <FormInput id="status" label="Estado da matrícula" icon={faUser} value={form.status} options={studentStatus} onChange={onChange} />
                    <FormInput id="name" label="Nome" icon={faUser} value={form.name} onChange={onChange} />
                    <FormInput
                        id="birthday"
                        type="date"
                        label="Data de nascimento"
                        icon={faCakeCandles}
                        value={form.birthday ? prismaDate(form.birthday).toISOString().substring(0, 10) : ""}
                        onChange={onChange}
                    />
                    <FormInput id="gender" label="Sexo" icon={faVenusMars} value={form.gender} onChange={onChange} />
                    <FormInput
                        id="color"
                        label="Cor/Raça"
                        icon={faUser}
                        options={studentColor}
                        value={form.color}
                        onChange={onChange}
                    />
                    <div className="flex justify-center gap-2">
                        <FormInput id="twins" label="Gêmeos" icon={faUser} value={form.twins} onChange={onChange} />
                        <FormInput id="has_brothers" label="Irmãos" icon={faUser} value={form.has_brothers} onChange={onChange} />
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
                    <FormInput id="health_issues" label="Problemas de Saúde" icon={faUser} value={form.health_issues} onChange={onChange} />
                    <FormInput id="food_restriction" label="Restrição Alimentar" icon={faUser} value={form.food_restriction} onChange={onChange} />
                    <FormInput id="allergy" label="Alergia" icon={faUser} value={form.allergy} onChange={onChange} />
                    <FormInput id="mobility" label="Mobilidade Reduzida" options={studentMobility} icon={faUser} value={form.mobility} onChange={onChange} />
                    <FormInput id="disabilities" label="Possui Deficiências Múltiplas" icon={faUser} value={form.disabilities} onChange={onChange} />
                    <FormInput id="special_needs" label="Criança Público Alvo de Educação Especial" icon={faUser} value={form.special_needs} onChange={onChange} />
                    <FormInput id="classification" label="Classificação" icon={faUser} options={studentClassifications} value={form.special_needs} onChange={onChange} />
                </>
            ) : tab == "Auxílio" ? (
                <>
                    <FormInput id="gov_aid" label="O Responsável é Beneficiário do Governo" icon={faUser} value={form.gov_aid} onChange={onChange} />
                    <FormInput id="nis_number" label="Número do NIS" icon={faUser} value={form.nis_number} onChange={onChange} />
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

                    {Array.isArray(form.family) && form.family.length > 0 && (() => {
                        const total = form.family.reduce((sum, member) => sum + (Number(member["sálario"]) || 0), 0);
                        const perCapita = total / form.family.length;

                        // formatador de moeda brasileira
                        const formatCurrency = (value: number) =>
                            value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", });

                        return (
                            <div className="grid grid-cols-2 mt-2 text-primary text-sm text-center">
                                <h1>Renda familiar total: <strong>{formatCurrency(total)}</strong></h1>
                                <h1>Renda per capita: <strong>{formatCurrency(perCapita)}</strong></h1>
                            </div>
                        );
                    })()}

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
                        <FormInput id="street" label="Rua" icon={faUser} value={form.street} onChange={onChange} />
                        <FormInput id="number" label="Número" icon={faUser} value={form.number} onChange={onChange} />
                        <FormInput id="neighborhood" label="Bairro" icon={faUser} value={form.neighborhood} onChange={onChange} />
                    </div>
                    <div className="flex gap-2">
                        <FormInput id="city" label="Município" icon={faUser} value={form.city} onChange={onChange} fullWidth />
                        <FormInput id="state" label="UF" icon={faUser} value={form.state} onChange={onChange} />
                    </div>
                    <FormInput id="reference" label="Pontos de Referência" icon={faUser} value={form.reference} onChange={onChange} />
                    <FormInput id="cep" label="CEP" icon={faUser} value={form.cep} onChange={onChange} />
                    <div className={divStyle}>
                        <FormInput id="phone_home" label="Contato" icon={faUser} value={form.phone_home} onChange={onChange} fullWidth />
                        <FormInput id="phone_alt" label="Outro contato" icon={faUser} value={form.phone_alt} onChange={onChange} fullWidth />
                    </div>
                </>
            ) : tab == "Documentação" ? (
                <>
                    <div className={divStyle}>
                        <FormInput id="birth_cert" label="Certidão de Nascimento Nº" icon={faUser} value={form.birth_cert} onChange={onChange} fullWidth />
                        <FormInput id="birth_city" label="Município de Nascimento" icon={faUser} value={form.birth_city} onChange={onChange} fullWidth />
                    </div>
                    <div className={divStyle}>
                        <FormInput id="registry_city" label="Município de Registro" icon={faUser} value={form.registry_city} onChange={onChange} fullWidth />
                        <FormInput id="registry_office" label="Cartório de Registro" icon={faUser} value={form.street} onChange={onChange} fullWidth />
                    </div>
                    <FormInput id="cpf" label="CPF" icon={faUser} value={form.cpf} onChange={onChange} />
                    <div className={divStyle}>
                        <FormInput id="rg" label="RG" icon={faUser} value={form.rg} onChange={onChange} />
                        <FormInput id="rg_issue_date" label="Data de Emissão" type="date" icon={faUser} value={form.rg_issue_date} onChange={onChange} />
                        <FormInput id="rg_issuer" label="Orgão Emissor" icon={faUser} value={form.rg_issuer} onChange={onChange} />
                    </div>
                </>
            ) : tab == "Casa" ? (
                <>
                    <FormInput id="type" label="Casa" icon={faUser} options={studentHouses} value={form.type} onChange={onChange} />
                    <FormInput id="rent_value" label="Valor do Aluguel" icon={faUser} type="number" value={form.rent_value} onChange={onChange} />
                    <FormInput id="rooms" label="Nº de Comodos" icon={faUser} type="number" value={form.rooms} onChange={onChange} />
                    <div className={divStyle}>
                        <FormInput id="floor_type" label="Tipo de Piso" icon={faUser} options={studentFloors} value={form.floor_type} onChange={onChange} fullWidth />
                        <FormInput id="building_type" label="Tipo de Moradia" icon={faUser} options={studentBuildings} value={form.building_type} onChange={onChange} fullWidth />
                        <FormInput id="roof_type" label="Tipo de Cobertura" icon={faUser} options={studentRoofs} value={form.building_type} onChange={onChange} fullWidth />
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <FormInput id="sewer" label="Fossa" icon={faUser} value={form.sewer} onChange={onChange} />
                        <FormInput id="septic_tank" label="Cifon" icon={faUser} value={form.septic_tank} onChange={onChange} />
                        <FormInput id="electricity" label="Energia Elétrica" icon={faUser} value={form.electricity} onChange={onChange} />
                        <FormInput id="water" label="Água Encanada" icon={faUser} value={form.water} onChange={onChange} />
                    </div>
                </>
            ) : (
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
            )}
            {/* <FormInput id="guardian_id" options={[[-1, "Selecione um responsavel"], ...guardians.map((guardian): [number, string] => [guardian.id, guardian.name])]} label="Responsável" value={form.guardian_id} onChange={onChange} /> */}
        </TabForm>
    )
}