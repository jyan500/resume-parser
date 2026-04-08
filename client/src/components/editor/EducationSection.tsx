import React, { useRef, useState } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    addEducation,
    updateEducation,
    removeEducation,
    toggleEducation,
    toggleSectionVisibility,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { AddButton } from "../page-elements/AddButton";
import type { EducationEntry } from "../../types/resume";
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion";

// ─── Section ──────────────────────────────────────────────────────────────────

interface EducationSectionProps {
    // Injected by the section-level DndSortableWrapperPreview in EditorPanel.
    // Spread onto the drag handle <button> inside SectionWrapper's header.
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ dragHandleProps }) => {
    const dispatch = useAppDispatch();
    const education = useAppSelector(selectResume).education;
    const visible = useAppSelector(selectVisibility).education;

    return (
        <SectionWrapper
            title="Education"
            sectionKey="education"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("education"))}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <AddButton label="Add Education" onClick={() => dispatch(addEducation())} />
            }
        >
            {education.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No education added yet.</p>
            )}
            <div className="flex flex-col gap-3">
                {education.map((edu) => (
                    <EducationEntryRow
                        key={edu.id}
                        entry={edu}
                        onUpdate={(patch) => dispatch(updateEducation({ id: edu.id, patch }))}
                        onRemove={() => dispatch(removeEducation(edu.id))}
                        onToggle={() => dispatch(toggleEducation(edu.id))}
                    />
                ))}
            </div>
        </SectionWrapper>
    );
};

// ─── Entry card ───────────────────────────────────────────────────────────────

interface EducationEntryRowProps {
    entry: EducationEntry;
    onUpdate: (patch: Partial<EducationEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
}

const EducationEntryRow: React.FC<EducationEntryRowProps> = ({ entry, onUpdate, onRemove, onToggle }) => {
    const dispatch = useAppDispatch();
    // const [expanded, setExpanded] = useState(true);
    const { subToggleVisibility } = useAppSelector((state) => state.resume)
    const rootRef = useRef<HTMLDivElement>(null)
    useScrollToFocusedRegion(rootRef, entry.id)

    return (
        <div ref={rootRef} className={`rounded-xl border transition-colors duration-150 ${entry.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {/* Header row */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-slate-300 cursor-grab flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                </span>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        entry.enabled ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                    }`}
                >
                    {entry.enabled && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                        {entry.school || <span className="text-slate-400 font-normal italic">Unnamed school</span>}
                    </p>
                    {entry.degree && (
                        <p className="text-xs text-slate-500 truncate">
                            {entry.degree}{entry.field ? `, ${entry.field}` : ""}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onRemove}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        onClick={() => dispatch(setSubToggleVisibility({regionId: entry.id, isOpen: !subToggleVisibility[entry.id]}))}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                    >
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${subToggleVisibility[entry.id] ? "rotate-0" : "-rotate-90"}`}
                            fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Fields */}
            {subToggleVisibility[entry.id] && (
                <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="col-span-2">
                            <Field
                                label="School"
                                value={entry.school}
                                onChange={(v) => onUpdate({ school: v })}
                                placeholder="University of California, Berkeley"
                            />
                        </div>
                        <Field
                            label="Degree"
                            value={entry.degree}
                            onChange={(v) => onUpdate({ degree: v })}
                            placeholder="Bachelor's"
                        />
                        <Field
                            label="Field of Study"
                            value={entry.field ?? ""}
                            onChange={(v) => onUpdate({ field: v })}
                            placeholder="Computer Science"
                        />
                        <Field
                            label="Start Date"
                            value={entry.startDate ?? ""}
                            onChange={(v) => onUpdate({ startDate: v })}
                            placeholder="Aug 2018"
                        />
                        <Field
                            label="End Date"
                            value={entry.endDate}
                            onChange={(v) => onUpdate({ endDate: v })}
                            placeholder="May 2022"
                        />
                        <Field
                            label="GPA"
                            value={entry.gpa ?? ""}
                            onChange={(v) => onUpdate({ gpa: v })}
                            placeholder="3.8"
                        />
                        <Field
                            label="Location"
                            value={entry.location ?? ""}
                            onChange={(v) => onUpdate({ location: v })}
                            placeholder="Berkeley, CA"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
