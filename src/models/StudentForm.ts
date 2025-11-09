import { formatCPF, formatCurrency, formatPhone, formatRG, parseID } from "@/lib/format";
import { Guardian } from "@prisma/client";
import { format } from "path";
import { z } from "zod";
//npm install docxtemplater pizzip
export const studentStatus = ["Espera", "Matriculado", "Desligado"];
export const studentMobility = ["Nenhuma", "Temporária", "Permanente"];
export const studentClassifications = [
    "Nenhuma (sem deficiência ou condição específica)", "Altas Habilidades(Superdotação)", "Cegueira",
    "Deficiência Auditiva (leve ou moderada)", "Deficiência Auditiva (severa ou profunda)", "Deficiência Auditiva (processamento central)",
    "Deficiência Física (cadeirante - permanente)", "Deficiência Física (paralisia cerebral)", "Deficiência Física (paraplegia ou monoplegia)", "Deficiência Física (outros)",
    "Deficiência Intelectual", "Deficiência Mental", "Deficiência Visual (baixa visão)", "Disfemia (gagueira)",
    "Sensorial Alta (sensibilidade)", "Sensorial Baixa (sensibilidade)",
    "Espectro Autista Nível 1", "Espectro Autista Nível 2", "Espectro Autista Nível 3",
    "Estrabismo", "Surdo", "Sindrome de Down",
    "TEA", "TDAH", "TOD",
]
export const studentHouses = ["Própria", "Cedida", "Alugada"];
export const studentFloors = ["Cimento", "Lajota", "Chão Batido"];
export const studentBuildings = ["Tijolo", "Taipa", "Madeira"]
export const studentRoofs = ["Cobertura de Telha", "Cobertura de Zinco", "Cobertura de Palha"];
export const studentColor = ["Não declarada", "Branca", "Preta", "Parda", "Amarela", "Indigena"];

export class StudentForm {
    id = -1;
    status = studentStatus[0];
    name = "";
    birthday: Date | null = null;
    gender = "";
    color = studentColor[0];
    twins = false;
    has_siblings = false;
    //saúde e deficiências
    sus: Record<string, string> = { "Número do Cartão SUS": "", "Unidade de Saúde": "" };
    health_issues = "";
    food_restriction = "";
    allergy = "";
    mobility = studentMobility[0];
    disabilities = "";
    special_needs = "";
    classification = studentClassifications[0];
    //auxílios sociais
    gov_aid = "";
    nis_number = "";
    //
    dad_id = -1;
    dad: Guardian | null = null;
    mom_id = -1;
    mom: Guardian | null = null;
    guardian_id = -1;
    guardian: Guardian | null = null;
    family: Record<string, string | number | Date>[] = [
        { nome: "", parentesco: "", idade: 0, "educação": "", "profissão": "", "sálario": 0 }
    ];
    authorized: Record<string, string>[] = [
        { nome: "", parentesco: "", rg: "", contato: "" }
    ];
    //endereço
    street = "";
    number = "";
    reference = "";
    neighborhood = "";
    city = "";
    state = "";
    cep = "";
    phone_home = "";
    phone_alt = "";
    //documentação
    birth_cert = "";
    registry_city = "";
    birth_city = "";
    registry_office = "";
    cpf = "";
    rg = "";
    rg_issue_date: Date | null = null;
    rg_issuer = "";
    //casa
    type = studentHouses[0];
    rent_value = 0;
    rooms = 1;
    floor_type = studentFloors[0];
    building_type = studentBuildings[0];
    roof_type = studentRoofs[0];
    septic_tank = true;
    cifon = true;
    electricity = true;
    water = true;
    //bens
    tv = false;
    dvd = false;
    radio = false;
    computer = false;
    notebook = false;
    phone_fixed = false;
    phone_mobile = false;
    tablet = false;
    internet = false;
    cable_tv = false;
    stove = false;
    fridge = false;
    freezer = false;
    microwave = false;
    washing_machine = false;
    air_conditioner = false;
    bicycle = false;
    motorcycle = false;
    car = false;

    constructor(data: Partial<StudentForm> = {}) {
        Object.assign(this, data);
        this.dad_id = data.dad_id ? Number(data.dad_id) : -1;
        this.mom_id = data.mom_id ? Number(data.mom_id) : -1;
        this.guardian_id = data.guardian_id ? Number(data.guardian_id) : -1;
        this.phone_home = formatPhone(data.phone_home ?? "");
        this.phone_alt = formatPhone(data.phone_alt ?? "");
        this.cpf = data.cpf ? formatCPF(data.cpf) : "";
        this.rg = data.rg ? formatRG(data.rg) : "";
        if (Array.isArray(data.authorized)) {
            this.authorized = data.authorized.map(auth => ({
                ...auth,
                rg: typeof auth.rg === "string" ? formatRG(auth.rg) : auth.rg,
                contato: typeof auth.contato === "string" ? formatPhone(auth.contato) : auth.contato,
            }));
        }
    }

    getAge() {
        const today = new Date();
        const birth = this.birthday || new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    getAgeGroup() {
        const age = this.getAge();
        if (age <= 1) return "0–1 anos";
        if (age <= 3) return "2–3 anos";
        if (age <= 5) return "4–5 anos";
        return "Mais de 5 anos";
    }

    getTotal() {
        if (Array.isArray(this.family) && this.family.length > 0) {
            const total = this.family.reduce((sum, member) =>
                sum + (Number(member["sálario"]) || 0), 0
            );
            return total;
        }
        return 0;
    }
    getPerCapta() {
        if (Array.isArray(this.family) && this.family.length > 0) {
            const perCapta = this.getTotal() / this.family.length;
            return perCapta;
        }
        return 0;
    }
    getIncomeGroup() {
        const perCapta = this.getPerCapta()
        if (perCapta <= 200) return "Até 200";
        if (perCapta <= 400) return "200–400";
        if (perCapta <= 800) return "400–800";
        return "Acima de 800";
    }


    getDocxData() {
        const form = this.getData();

        function formatDate(value: any) {
            if (!value) return "";
            const date = new Date(value);
            if (isNaN(date.getTime())) return "";
            return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
        }
        function convertBooleans(obj: any): any {
            if (Array.isArray(obj)) { return obj.map(convertBooleans); }
            else if (obj && typeof obj === "object") {
                const newObj: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === "boolean") {
                        newObj[key] = value ? "☑" : "☐";
                    } else {
                        newObj[key] = convertBooleans(value);
                    }
                }
                return newObj;
            }
            return obj;
        }
        //npm install docxtemplater expressions
        const data = {
            ...form.student,
            birthday: form.student.birthday ? formatDate(form.student.birthday) : "",
            address: form.address,
            document: form.document,
            housing: convertBooleans(form.housing),
            asset: convertBooleans(form.asset),
            family: this.family.map(member => ({
                name: member["nome"],
                age: member["idade"],
                kinship: member["parentesco"],
                education: member["educação"],
                profession: member["profissão"],
                salary: formatCurrency(Number(member["sálario"]) || 0)
            })),
            total: formatCurrency(this.getTotal()),
            per_capta: formatCurrency(this.getPerCapta()),
        };
        return convertBooleans(data);
    }
    getData() {
        return {
            student: {
                ...parseID("id", this.id),
                status: this.status,
                name: this.name,
                birthday: this.birthday ? new Date(this.birthday) : null,
                gender: this.gender,
                color: this.color,
                twins: this.twins,
                has_siblings: this.has_siblings,
                sus: this.sus,
                health_issues: this.health_issues,
                food_restriction: this.food_restriction,
                allergy: this.allergy,
                mobility: this.mobility,
                disabilities: this.disabilities,
                special_needs: this.special_needs,
                classification: this.classification,
                gov_aid: this.gov_aid,
                nis_number: this.nis_number,

                ...parseID("dad_id", this.dad_id),
                ...parseID("mom_id", this.mom_id),
                ...parseID("guardian_id", this.guardian_id),
                family: this.family,
                authorized: this.authorized,
            },
            address: {
                street: this.street,
                number: this.number,
                reference: this.reference,
                neighborhood: this.neighborhood,
                city: this.city,
                state: this.state,
                cep: this.cep,
                phone_home: this.phone_home,
                phone_alt: this.phone_alt
            },
            document: {
                birth_cert: this.birth_cert,
                registry_city: this.registry_city,
                birth_city: this.birth_city,
                registry_office: this.registry_office,
                cpf: this.cpf,
                rg: this.rg,
                rg_issue_date: this.rg_issue_date ? new Date(this.rg_issue_date) : null,
                rg_issuer: this.rg_issuer
            },
            housing: {
                type: this.type,
                rent_value: this.rent_value,
                rooms: this.rooms,
                floor_type: this.floor_type,
                building_type: this.building_type,
                roof_type: this.roof_type,
                septic_tank: this.septic_tank,
                cifon: this.cifon,
                electricity: this.electricity,
                water: this.water
            },
            asset: {
                tv: this.tv,
                dvd: this.dvd,
                radio: this.radio,
                computer: this.computer,
                notebook: this.notebook,
                phone_fixed: this.phone_fixed,
                phone_mobile: this.phone_mobile,
                tablet: this.tablet,
                internet: this.internet,
                cable_tv: this.cable_tv,
                stove: this.stove,
                fridge: this.fridge,
                freezer: this.freezer,
                microwave: this.microwave,
                washing_machine: this.washing_machine,
                air_conditioner: this.air_conditioner,
                bicycle: this.bicycle,
                motorcycle: this.motorcycle,
                car: this.car
            }
        }
    }
    verify() {
        const result = schema.safeParse(this.getData());
        if (!result.success) {
            return result.error.issues.map(i => i.message).join("<br>");
        }
        return "";
    }
}
const schema = z.object({
    student: z.object({
        name: z.string("Nome é obrigatório").min(1, "Nome inválido"),
        birthday: z.date("Data de nascimento é obrigatório").refine((date) => {
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            const hasBirthdayPassed =
                today.getMonth() > date.getMonth() ||
                (today.getMonth() === date.getMonth() &&
                    today.getDate() >= date.getDate());
            const realAge = hasBirthdayPassed ? age : age - 1;

            return realAge <= 8;
        }, { message: "A criança deve ter no máximo 8 anos" }),
    })
});


