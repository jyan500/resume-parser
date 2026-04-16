import React, { forwardRef } from "react";
import { GripVertical, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleSectionCollapseVisibility } from "../../slices/resumeSlice"
import type { ToggleVisibility } from "../../types/resume";

interface SectionWrapperProps {
    title: string;
    sectionKey: keyof ToggleVisibility 
    visible?: boolean;
    onToggleVisibility?: () => void;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightSlot?: React.ReactNode;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const SectionWrapper = forwardRef<HTMLDivElement, SectionWrapperProps>(({
    title,
    sectionKey,
    visible = true,
    onToggleVisibility,
    children,
    defaultOpen = true,
    rightSlot,
    dragHandleProps,
}, ref) => {

    const { toggleVisibility } = useAppSelector((state) => state.resume)
    const dispatch = useAppDispatch()

    return (
        <div ref={ref} className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    {/* Section-level drag handle — only rendered for orderable sections */}
                    {dragHandleProps && (
                        <button
                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                            aria-label="Drag to reorder section"
                            {...dragHandleProps}
                        >
                            <GripVertical className="w-4 h-4" strokeWidth={2} />
                        </button>
                    )}
                    <button
                        onClick={() => dispatch(toggleSectionCollapseVisibility({key: sectionKey, isOpen: !toggleVisibility[sectionKey]}))}
                        className="text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${toggleVisibility[sectionKey] ? "rotate-0" : "-rotate-90"}`}
                            strokeWidth={2.5}
                        />
                    </button>
                    <span className="text-sm font-semibold text-slate-800">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {rightSlot}
                    {onToggleVisibility && (
                        <button
                            onClick={onToggleVisibility}
                            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors duration-150 ${
                                visible
                                    ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {visible ? (
                                <>
                                    <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
                                    Show
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            {/* Content */}
            {toggleVisibility[sectionKey] && <div className="px-4 py-3">{children}</div>}
        </div>
    );
});
