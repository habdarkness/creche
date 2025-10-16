import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "./Loader";

type Props = {
    submit?: boolean
    text?: string;
    icon?: IconProp;
    onClick?: () => void;
    color?: string;
    loading?: boolean;
};

export default function FormButton({ submit, text = "", icon, color = "bg-primary", loading, onClick }: Props) {
    return (
        <button
            type={submit ? "submit" : "button"}
            className={`flex gap-2 items-center text-white rounded-lg p-2 transition cursor-pointer ${color} hover:scale-105`}
            onClick={onClick}
        >
            {text}
            {loading ? (
                <Loader className="size-5" />
            ) : icon && (
                <FontAwesomeIcon icon={icon} />
            )}
        </button>
    );
}
