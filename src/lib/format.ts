export function cleanObject(object: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(object).map(([k, v]) => [k, v === null ? "" : v])
    );
}
export function parseID(id: string, value?: number) {
    if (value == -1) return {};
    return { [id]: value };
}

export function capitalize(text: string, onlyLast: boolean = false) {
    const words = text.toLowerCase().split(" ");
    if (onlyLast && words.length > 1) {
        const lastIndex = words.length - 1;
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        words[lastIndex] = words[lastIndex].charAt(0).toUpperCase() + words[lastIndex].slice(1);
        return words[0] + " " + words[lastIndex];
    }
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(" ")
}
export function formatCPF(cpf: string) {
    return cpf
        .replace(/\D/g, "").slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function formatRG(rg: string): string {
    return rg
        .replace(/\D/g, "").slice(0, 10)
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    let formatted = '';

    if (digits.length <= 2) { formatted = `+${digits}`; }
    else if (digits.length <= 4) { formatted = `+${digits.slice(0, 2)} (${digits.slice(2)}`; }
    else if (digits.length <= 9) { formatted = `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`; }
    else if (digits.length <= 12) { formatted = `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`; }
    else if (digits.length <= 13) { formatted = `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`; }
    else { formatted = `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`; }

    return formatted;
}
export function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", })
}
export function formatDate(value?: Date | string | null): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}
