import { z } from "zod";

export const studentStatus: string[] = ["Espera", "Matriculado", "Desligado"];
export const mobilityTypes: string[] = ["Temporária", "Permanente"];
export const studentClassifications: String[] = [
    "", "Altas Habilidades(Superdotação)", "Cegueira",
    "Deficiência Auditiva (leve ou moderada)", "Deficiência Auditiva (severa ou profunda)", "Deficiência Auditiva (processamento central)",
    "Deficiência Física (cadeirante - permanente)", "Deficiência Física (parilisia cerebral)", "Deficiência Física (paraplegia ou monoplegia)", "Deficiência Física (outros)",
    "Deficiência Intelectual", "Deficiência Mental", "Deficiência Visual (baixa visão)", "Disfemia (guagueira)",
    "Sensorial Alta (sensibilidade)", "Sensorial Baixa (sensibilidade)",
    "Espectro Autista Nível 1", "Espectro Autista Nível 2", "Espectro Autista Nível 3",
    "Estrabismo", "Surdo", "Sindrome de Down",
    "TEA", "TDAH", "TOD",
]
export const houseTypes: string[] = ["Própria", "Cedida", "Alugada"];
export const floorTypes: string[] = ["Cimento", "Lajota", "Chão Batido"];
export const buildingTypes: string[] = ["Tijolo", "Taipa", "Madeira", "Cobertura de Telha", "Cobertura de Zinco", "Cobertura de Palha"];

export class StudentForm {
    id = -1;
    status = studentStatus[0];
    name = "";
    birthday: Date | null = null;
    gender = "M";
    color = "";
    twins = false;
    has_brothers = false;
    guardians_ids: number[] = []
    // sus
    sus: Record<string, string> = {};
    //saúde e deficiências
    health_issues = "";
    food_restriction = "";
    allergy = "";
    mobility = mobilityTypes[0];
    disabilities: string[] = [];
    special_needs = "";
    classification = studentClassifications[0];
    //auxílios sociais
    gov_aid = "";
    nis_number = "";
    //
    family: Record<string, string>[] = [
        { name: "", kinship: "", age: "", education: "", profession: "", income: "" }
    ];
    authorized: Record<string, string>[] = [
        { name: "", kinship: "", rg: "", phone: "" }
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
    rg_issue_date = "";
    rg_issuer = "";
    //casa
    type = houseTypes[0];
    rent_value = 0;
    rooms = 1;
    floor_type = floorTypes[0];
    building_type = buildingTypes[0];
    roof_type = "";
    sewer = true;
    septic_tank = true;
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

    constructor(data: Partial<StudentForm> = {}) { Object.assign(this, data); }

    getData() {
        return {
            student: {
                ...(this.id != -1 ? { id: this.id } : {}),
                status: this.status,
                name: this.name,
                birthday: this.birthday,
                gender: this.gender,
                color: this.color,
                twins: this.twins,
                has_brothers: this.has_brothers,
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
                family: this.family,
                authorized: this.authorized,
                guardians_ids: this.guardians_ids
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
            documents: {
                birth_cert: this.birth_cert,
                registry_city: this.registry_city,
                birth_city: this.birth_city,
                registry_office: this.registry_office,
                cpf: this.cpf,
                rg: this.rg,
                rg_issue_date: this.rg_issue_date,
                rg_issuer: this.rg_issuer
            },
            housing: {
                type: this.type,
                rent_value: this.rent_value,
                rooms: this.rooms,
                floor_type: this.floor_type,
                building_type: this.building_type,
                roof_type: this.roof_type,
                sewer: this.sewer,
                septic_tank: this.septic_tank,
                electricity: this.electricity,
                water: this.water
            },
            assets: {
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
        const result = loginSchema.safeParse(this.getData());
        if (!result.success) {
            return result.error.issues.map(e => e.message).join("\n");
        }
        return "";
    }
}
const loginSchema = z.object({
    name: z.string().min(1, "Nome inválido"),
    birthday: z.date().refine((date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const hasBirthdayPassed =
            today.getMonth() > date.getMonth() ||
            (today.getMonth() === date.getMonth() &&
                today.getDate() >= date.getDate());
        const realAge = hasBirthdayPassed ? age : age - 1;

        return realAge <= 6;
    }, { message: "A criança deve ter no máximo 6 anos" }),
    gender: z.enum(["M", "F"], "Tipo inválido"),
    guardian_id: z.int()
});


