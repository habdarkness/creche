type Props = {
    color?: "primary" | "reverse" | "red" | "green" | "blue";
    className?: string;
};

export default function Loader({ className = "size-8", color = "reverse" }: Props) {
    const colorMap = {
        primary: "border-primary",
        reverse: "border-reverse-500",
        red: "border-red-500",
        green: "border-green-500",
        blue: "border-blue-500",
    };

    return (
        <div
            className={`${className} border-4 ${colorMap[color]} border-t-transparent rounded-full animate-spin`}
        />
    );
}
