import React, { useRef, useState } from "react";
import { GripVertical, Check, X, ChevronDown } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    addEducation,
    updateEducation,
    removeEducation,
    toggleEducation,
    toggleSectionVisibility,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
    updateSectionTitle,
    DEFAULT_SECTION_TITLES,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { MiniButton } from "../page-elements/MiniButton";
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
    const sectionTitle = useAppSelector((state) => state.resume.sectionTitles.education);

    return (
        <SectionWrapper
            title={sectionTitle}
            sectionKey="education"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("education"))}
            onTitleChange={(t) => dispatch(updateSectionTitle({ key: "education", title: t }))}
            defaultTitle={DEFAULT_SECTION_TITLES.education}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <MiniButton label="Add Education" onClick={() => dispatch(addEducation())} />
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
                    <GripVertical className="w-4 h-4" strokeWidth={2} />
                </span>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        entry.enabled ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                    }`}
                >
                    {entry.enabled && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
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
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => dispatch(setSubToggleVisibility({regionId: entry.id, isOpen: !subToggleVisibility[entry.id]}))}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                    >
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${subToggleVisibility[entry.id] ? "rotate-0" : "-rotate-90"}`}
                            strokeWidth={2.5}
                        />
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
                                placeholder="School Name"
                            />
                        </div>
                        <Field
                            label="Degree"
                            value={entry.degree}
                            onChange={(v) => onUpdate({ degree: v })}
                            placeholder="Degree"
                        />
                        <Field
                            label="Field of Study"
                            value={entry.field ?? ""}
                            onChange={(v) => onUpdate({ field: v })}
                            placeholder="Field of Study"
                        />
                        <Field
                            label="Start Date"
                            value={entry.startDate ?? ""}
                            onChange={(v) => onUpdate({ startDate: v })}
                            placeholder="Date"
                        />
                        <Field
                            label="End Date"
                            value={entry.endDate}
                            onChange={(v) => onUpdate({ endDate: v })}
                            placeholder="Date"
                        />
                        <Field
                            label="GPA"
                            value={entry.gpa ?? ""}
                            onChange={(v) => onUpdate({ gpa: v })}
                            placeholder="GPA"
                        />
                        <Field
                            label="Location"
                            value={entry.location ?? ""}
                            onChange={(v) => onUpdate({ location: v })}
                            placeholder="Location"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
