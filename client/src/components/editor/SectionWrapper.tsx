import React, { forwardRef } from "react";
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
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                                />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => dispatch(toggleSectionCollapseVisibility({key: sectionKey, isOpen: !toggleVisibility[sectionKey]}))}
                        className="text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${toggleVisibility[sectionKey] ? "rotate-0" : "-rotate-90"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
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
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                    Hide
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
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
