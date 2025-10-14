export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null && value != undefined)
    ) as Partial<T>;
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