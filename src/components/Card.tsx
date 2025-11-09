type Props = {
    children?: React.ReactNode;
    disabled?: boolean;
    pressable?: boolean;
    onClick?: () => void;
}

export default function Card({ children, pressable = false, disabled = false, onClick }: Props) {
    return (
        <li className={`flex flex-col ${disabled ? "bg-primary-darker" : "bg-primary"} text-white p-2 rounded-2xl ${pressable && "hover:scale-105 transition"}`} onClick={onClick}>{children}</li>
    )
}