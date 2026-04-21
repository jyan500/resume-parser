import React, { forwardRef, useState } from "react";
import { GripVertical, ChevronDown, Eye, EyeOff, Pencil, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { toggleSectionCollapseVisibility } from "../../slices/resumeSlice"
import type { ToggleVisibility } from "../../types/resume";
import { DebouncedInput } from "./DebouncedInput";

interface SectionWrapperProps {
    title: string;
    sectionKey: keyof ToggleVisibility
    visible?: boolean;
    onToggleVisibility?: () => void;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightSlot?: React.ReactNode;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
    onTitleChange?: (title: string) => void;
    defaultTitle?: string;
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
    onTitleChange,
    defaultTitle,
}, ref) => {

    const { toggleVisibility } = useAppSelector((state) => state.resume)
    const dispatch = useAppDispatch()
    const [isEditing, setIsEditing] = useState(false)

    const handlePencilClick = () => {
        setIsEditing(true)
    }

    const handleBlur = () => {
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setIsEditing(false)
        }
    }

    const handleReset = () => {
        if (defaultTitle) {
            onTitleChange?.(defaultTitle)
        }
        setIsEditing(false)
    }

    return (
        <div ref={ref} className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3">
            {/* Section header */}
            <div className="flex items-center justify-between gap-x-2 px-4 py-3 border-b border-slate-100 bg-white">
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
                    {isEditing && onTitleChange ? (
                        <>
                            <DebouncedInput
                                autoFocus
                                value={title}
                                onChange={onTitleChange}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                className="text-sm font-semibold text-slate-800 bg-transparent border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-48"
                            />
                            {defaultTitle && (
                                <button
                                    onClick={handleReset}
                                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                                    aria-label="Reset to default title"
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-semibold text-slate-800">{title}</span>
                            {onTitleChange && (
                                <button
                                    onClick={handlePencilClick}
                                    className="text-slate-400 hover:text-slate-500 transition-colors flex-shrink-0"
                                    aria-label="Edit section title"
                                >
                                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {rightSlot}
                    {onToggleVisibility && (
                        <button
                            onClick={onToggleVisibility}
                            title={visible ? "Hide section" : "Show section"}
                            aria-label={visible ? "Hide section" : "Show section"}
                            className={`flex items-center justify-center p-1.5 rounded-md transition-colors duration-150 ${
                                visible
                                    ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {visible ? (
                                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                            ) : (
                                <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
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
