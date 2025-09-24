import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronLeft, faChevronRight, faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "./Loader";
import { capitalize } from "@/lib/capitalize";
import FormButton from "./FormButton";

type Props = {
    visible?: boolean;
    tabs?: string[];
    tab?: string;
    rows?: number;
    onChangeTab?: (tab: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    onCancel?: () => void;
    submit?: string;
    submitIcon?: IconProp;
    children?: React.ReactNode;
    loading?: boolean;
}

export default function TabForm({ visible = true, tabs = [], tab = "", loading, submit = "", submitIcon = faFloppyDisk, rows = 2, onChangeTab, onSubmit, onCancel, children }: Props) {
    const row_size = Math.ceil(tabs.length / rows);
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
    };
    if (!visible) return;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
            <div className="flex flex-col max-w-3xl mx-8 drop-shadow-md">
                {/* Abas */}
                {tabs.length > 1 && (
                    <div className="grid auto-rows-min md:px-4">
                        {Array.from({ length: rows }).map((_, i) => {
                            const start = i * row_size;
                            const end = start + row_size;
                            const rowTabs = tabs.slice(start, end);
                            return (
                                <div
                                    key={i}
                                    className={`flex gap-1 ${i !== 0 && (rowTabs.includes(tab) ? "bg-primary-darker" : "bg-background")} rounded-xl shadow-lg`}
                                    style={{
                                        marginLeft: `${(rows - i) * 8}px`,
                                        marginRight: `${(rows - i) * 8}px`,
                                    }}
                                >
                                    {rowTabs.map((t) => (
                                        <button
                                            key={t}
                                            className={
                                                `md:block flex-1 rounded-xl rounded-b-none px-4 py-2 font-bold border-box
                                                ${tab === t
                                                    ? "text-primary bg-background"
                                                    : i != rows - 1
                                                        ? "text-background bg-primary border-b-2 border-primary-darker hidden"
                                                        : "text-background bg-primary hidden"
                                                }`
                                            }
                                            onClick={() => onChangeTab && onChangeTab(t)}
                                        >
                                            {capitalize(t)}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
                <form onSubmit={handleSubmit} className={`relative p-0 bg-background rounded-2xl shadow-xl overflow-hidden flex flex-col max-w-[90vw] max-h-[80vh] ${tabs.length > 1 && "h-[80vh]"} w-[640px]`}>
                    <div className="overflow-y-auto px-6 pt-6 pb-20 space-y-4 pr-6">
                        {loading ? (<Loader />) : children}
                        <FontAwesomeIcon icon={faXmark} onClick={onCancel} className="absolute right-0 top-0 bg-red-400 text-white min-w-[24px] min-h-[24px] p-1 rounded-full self-center hover:bg-red-500 transition duration-200 ease cursor-pointer" />
                        {submit != "" && (
                            <FormButton submit text={submit} icon={submitIcon} absolute />
                        )}
                    </div>
                    <div className="md:hidden">
                        {tabs.findIndex(t => t === tab) > 0 && (
                            <FontAwesomeIcon
                                className="text-lg text-white fixed left-[-16px] top-[50%] bg-primary min-w-5 min-h-5 p-1.5 rounded-full -translate-y-1/2 cursor-pointer"
                                icon={faChevronLeft}
                                onClick={() => {
                                    const currentIndex = tabs.findIndex(t => t === tab);
                                    onChangeTab && onChangeTab(tabs[currentIndex - 1]);
                                }}
                            />
                        )}

                        {tabs.findIndex(t => t === tab) < tabs.length - 1 && (
                            <FontAwesomeIcon
                                className="text-lg text-white fixed right-[-16px] top-[50%] bg-primary min-w-5 min-h-5 p-1.5 rounded-full -translate-y-1/2 cursor-pointer"
                                icon={faChevronRight}
                                onClick={() => {
                                    const currentIndex = tabs.findIndex(t => t === tab);
                                    onChangeTab && onChangeTab(tabs[currentIndex + 1]);
                                }}
                            />
                        )}

                    </div>
                </form>
            </div>
        </div>
    );
}