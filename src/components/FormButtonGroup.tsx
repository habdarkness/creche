import React, { ReactNode } from "react";

export default function FormButtonGroup({ children }: { children: ReactNode }) {
    return (

        <div className="flex gap-2 items-center absolute right-[50%] bottom-5 translate-x-1/2">
            {children}
        </div>
    )
}