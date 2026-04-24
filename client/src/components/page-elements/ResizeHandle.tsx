import React from "react";
import { Separator } from "react-resizable-panels";
import { HOVER_Z_INDEX } from "../../helpers/constants";

export const ResizeHandle: React.FC = () => (
    <Separator title={"Drag to resize"} className="relative bg-white w-6 bg-transparent flex items-center justify-center group outline-none cursor-col-resize">
        {/* Visual thin line — purely decorative, no pointer events */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-slate-200 pointer-events-none" />
        {/* Grip button */}
        <div className={`${HOVER_Z_INDEX} group-hover:bg-gray-50 bg-white transition-colors duration-75 pointer-events-none p-2 rounded-lg shadow-md flex flex-col gap-[3px]`}>
            <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-brand-accent/40 transition-colors duration-75" />
            <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-brand-accent/40 transition-colors duration-75" />
            <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-brand-accent/40 transition-colors duration-75" />
        </div>
    </Separator>
);

