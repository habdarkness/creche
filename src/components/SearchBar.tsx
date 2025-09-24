import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
type Props = {
    value: string
    onChange: (value: string) => void;
}
export default function SearchBar({ value, onChange }: Props) {
    return (
        <div className="flex flex-row bg-[#f2f2f2] rounded-2xl items-center px-3 py-2 w-full">
            <input
                type="text"
                placeholder="Pesquise um nome aqui..."
                className="flex-1 outline-none text-primary placeholder-primary/50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-primary ml-2 size-4" />
        </div>
    );
}
