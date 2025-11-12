type Props = {
    children?: React.ReactNode
}
export default function CardList({ children }: Props) {
    return (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 w-full gap-4">
            {children}
        </ul>
    )
}