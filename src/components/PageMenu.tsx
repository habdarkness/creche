import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

type Props = {
    options: Record<string, IconProp>;
    onSelect?: (index: number) => void;
}

export default function PageMenu({ options = {}, onSelect }: Props) {

    const menuRef = useRef<HTMLDivElement>(null);
    const [minHeight, setHeight] = useState(0);

    useEffect(() => {
        if (menuRef.current) setHeight(menuRef.current.offsetHeight);
    });

    return (
        <>
            <div style={{ minHeight }} />
            <div
                ref={menuRef}
                className="
                    fixed bottom-16 right-2 md:bottom-5 md:right-5
                    flex flex-col-reverse overflow-clip
                    bg-background border-background-darker border-reverse border-2
                    rounded-2xl shadow-md
                "
            >
                {Object.entries(options).map(([name, icon], index) => (
                    <button
                        key={name}
                        onClick={() => onSelect && onSelect(index)}
                        className="
                            flex flex-row items-center self-center
                            w-full hover:bg-primary p-2 justify-end
                            transition-all ease cursor-pointer
                        "
                    >
                        {name}
                        {icon && (<FontAwesomeIcon icon={icon} className="size-6 ml-1" />)}
                    </button>
                ))}
            </div>
        </>
    );
}
