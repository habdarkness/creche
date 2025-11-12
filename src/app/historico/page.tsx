"use client"

import Card from "@/components/Card";
import Loader from "@/components/Loader";
import PageLayout from "@/components/PageLayout";
import { capitalize } from "@/lib/format";
import { prismaDate } from "@/lib/prismaLib";
import { ActionWithRelations } from "@/types/prismaTypes";
import { User } from "@prisma/client";
import { act, useEffect, useState } from "react"

export default function Users() {
    const [loading, setLoading] = useState(false);
    const [actions, setActions] = useState<ActionWithRelations[]>([]);
    useEffect(() => {
        async function fetchActions() {
            try {
                setLoading(true);
                const res = await fetch("/api/action");
                const data = await res.json();
                setActions(Array.isArray(data) ? data : []);
            }
            catch (error) {
                console.error("Erro ao buscar responsáveis:", error);
                setActions([]);
            }
            finally { setLoading(false); }
        }
        fetchActions();
    }, []);
    const organized = actions.reduce((acc, action) => {
        const date = prismaDate(action.created_at).toLocaleString("pt-br", { weekday: "long", day: "2-digit", month: "2-digit", year: "2-digit" });
        if (!acc[date]) acc[date] = [];
        acc[date].push(action);
        return acc;
    }, {} as Record<string, Array<ActionWithRelations>>);

    return (
        <PageLayout title="Histórico de ações" loading={loading}>
            <ul className="flex flex-col gap-2">
                {Object.entries(organized).map(([day, dayActions]) => (
                    <li key={day}>
                        <h1 className="font-bold text-lg">{capitalize(day)}</h1>
                        <ul className="flex flex-col gap-0.5">
                            {dayActions.map((action) => (
                                <Card key={action.id}>
                                    <div className="flex flex-col gap-0.5 md:flex-row md:gap-1">
                                        <div className="flex gap-1 justify-between md:flex-row-reverse">
                                            <p className="font-bold">{capitalize(action.user ? action.user.name : action.user_name ?? "") + ":"}</p>
                                            <p className="font-bold text-black opacity-50">
                                                {prismaDate(action.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", })}
                                            </p>
                                        </div>
                                        {action.description}
                                    </div>
                                </Card>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </PageLayout>
    );

}