type Props = {
    children?: React.ReactNode
    columns?: number
}

export default function CardList({ children, columns = 4 }: Props) {
    return (
        <ul
            style={
                {
                    ['--cols-sm' as any]: Math.max(columns - 2, 1),
                    ['--cols-md' as any]: Math.max(columns - 1, 1),
                    ['--cols-lg' as any]: Math.max(columns, 1),
                } as React.CSSProperties
            }
            className="
                grid 
                [grid-template-columns:repeat(var(--cols-sm),minmax(0,1fr))] 
                sm:[grid-template-columns:repeat(var(--cols-md),minmax(0,1fr))] 
                lg:[grid-template-columns:repeat(var(--cols-lg),minmax(0,1fr))] 
                w-full gap-4
            "
        >
            {children}
        </ul>
    )
}
