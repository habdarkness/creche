import { Filter } from "@/components/Contexts";

export type ObjectFilters = {
    term: string;
    [key: string]: any;
};

export default function matches(object: ObjectFilters, search: string, filters: Filter[]) {
    const grouped = filters.reduce<Record<string, Filter[]>>((acc, f) => {
        if (!acc[f.key]) acc[f.key] = [];
        acc[f.key].push(f);
        return acc;
    }, {});

    function sameDay(a: any, b: any) {
        const da = a instanceof Date ? a : new Date(a);
        const db = b instanceof Date ? b : new Date(b);
        return (
            da.getUTCFullYear() === db.getUTCFullYear() &&
            da.getUTCMonth() === db.getUTCMonth() &&
            da.getUTCDate() === db.getUTCDate()
        );
    };

    const matchesFilters = Object.entries(grouped).every(([key, group]) => {
        const value = object[key];
        return group.some(f => {
            if (typeof f.value === "boolean") return Boolean(value) === f.value;
            if ((value instanceof Date || typeof value === "string") && (f.value instanceof Date || typeof f.value === "string")) {
                const isDateA = !isNaN(new Date(value).getTime());
                const isDateB = !isNaN(new Date(f.value).getTime());
                if (isDateA && isDateB) return sameDay(value, f.value);
            }

            return value == f.value;
        });
    });

    const matchesSearch = !search || String(object.term || "").toLowerCase().includes(search.toLowerCase());

    return matchesFilters && matchesSearch;
}
