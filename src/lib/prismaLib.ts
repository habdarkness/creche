
export function prismaDate(date: Date) {
    return date instanceof Date
        ? date
        : new Date(date);
}