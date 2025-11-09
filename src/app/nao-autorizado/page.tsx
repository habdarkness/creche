import PageLayout from "@/components/PageLayout";

export default function NonAuthorized() {
    return (
        <PageLayout>
            <div className="flex w-full h-full justify-center items-center">
                <p className="text-3xl font-bold">Acesso não autorizado</p>
            </div>
        </PageLayout>
    )
}