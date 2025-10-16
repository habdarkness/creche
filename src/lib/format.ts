export function cleanObject(object: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(object).map(([k, v]) => [k, v === null ? "" : v])
    );
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