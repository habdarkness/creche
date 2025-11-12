import Loader from "./Loader"

type Props = {
    title?: string
    loading?: boolean
    children?: React.ReactNode
}

export default function PageLayout({ title = "", loading = false, children }: Props) {
    if (loading) return (<div className="flex items-center justify-center h-full"><Loader /></div>)
    return (
        <div className="flex flex-col m-4 h-full gap-2">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            {children}
            <div className="min-h-18 md:min-h-10" />
        </div>
    )
}