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

    const matchesFilters = Object.entries(grouped).every(([key, group]) => {
        const value = object[key];
        return group.some(f => {
            if (typeof f.value === "boolean") return Boolean(value) === f.value;
            return value == f.value;
        });
    });

    const matchesSearch = !search || String(object.term || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilters && matchesSearch;
}
