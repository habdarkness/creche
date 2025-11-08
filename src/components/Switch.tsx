type Props = {
    checked: boolean;
    setChecked?: (checked: boolean) => void;
    disabled?: boolean;
}
export default function Switch({ checked, setChecked, disabled }: Props) {
    return (
        <div
            className={`flex relative w-8 h-4 rounded-full items-center p-1 cursor-pointer transition-colors ${checked ? "bg-primary" : "bg-gray-500"}`}
            onClick={() => !disabled && setChecked && setChecked(!checked)}
        >
            <div
                className={`absolute size-3 bg-white rounded-full transition-all duration-300 ${checked ? "left-[calc(100%-0.75rem-2px)]" : "left-[2px]"}`}
            />
        </div>
    )
}