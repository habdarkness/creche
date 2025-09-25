// lib/csv.ts
export function generateCSV<T>(data: T[], headers: string[], mapRow: (item: T) => (string | number)[]): string {
    // Cria o cabeçalho
    const csvArray = [headers, ...data.map(mapRow)];

    // Junta cada linha com vírgula e depois junta as linhas com \n
    return csvArray.map(row => row.join(",")).join("\n");
}
