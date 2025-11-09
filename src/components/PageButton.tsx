import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
    text?: string;
    onClick?: () => void;
    icon?: IconProp
}

export default function PageButton({ text = "", icon, onClick }: Props) {
    return (
        <>
            <div className="min-h-11 md:min-h-18" />
            <button
                onClick={onClick}
                className="
                    fixed bottom-16 right-2 md:bottom-5 md:right-5
                    flex flex-row items-center self-center
                    bg-background hover:bg-primary border-background-darker border-reverse border-2 rounded-2xl p-2 ml-auto shadow-md
                    transition-all ease cursor-pointer"
            >
                {text}{icon && (<FontAwesomeIcon icon={icon} className="size-6 ml-1" />)}
            </button>
        </>
    )
}