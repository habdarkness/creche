import React, { ReactNode } from "react";

export default function FormButtonGroup({ children }: { children: ReactNode }) {
    return (

        <div className="flex gap-2 w-full justify-end px-4 items-center absolute right-[50%] bottom-1 translate-x-1/2">
            {children}
        </div>
    )
}