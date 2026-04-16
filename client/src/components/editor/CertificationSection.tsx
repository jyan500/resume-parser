import React, { useState, useRef } from "react";
import { GripVertical, Check, X, ChevronDown } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    addCertification,
    updateCertification,
    removeCertification,
    toggleCertification,
    toggleSectionVisibility,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { AddButton } from "../page-elements/AddButton";
import type { CertificationEntry } from "../../types/resume";
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion";

// ─── Section ──────────────────────────────────────────────────────────────────

interface CertificationSectionProps {
    // Injected by the section-level DndSortableWrapperPreview in EditorPanel.
    // Spread onto the drag handle <button> inside SectionWrapper's header.
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({ dragHandleProps }) => {
    const dispatch = useAppDispatch();
    const certifications = useAppSelector(selectResume).certifications;
    const visible = useAppSelector(selectVisibility).certifications;

    return (
        <SectionWrapper
            sectionKey={"certifications"}
            title="Certifications"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("certifications"))}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <AddButton label="Add Certification" onClick={() => dispatch(addCertification())} />
            }
        >
            {certifications.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No certifications added yet.</p>
            )}
            <div className="flex flex-col gap-3">
                {certifications.map((cert) => (
                    <CertificationEntryRow
                        key={cert.id}
                        entry={cert}
                        onUpdate={(patch) => dispatch(updateCertification({ id: cert.id, patch }))}
                        onRemove={() => dispatch(removeCertification(cert.id))}
                        onToggle={() => dispatch(toggleCertification(cert.id))}
                    />
                ))}
            </div>
        </SectionWrapper>
    );
};

// ─── Entry card ───────────────────────────────────────────────────────────────

interface CertificationEntryRowProps {
    entry: CertificationEntry;
    onUpdate: (patch: Partial<CertificationEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
}

const CertificationEntryRow: React.FC<CertificationEntryRowProps> = ({ entry, onUpdate, onRemove, onToggle }) => {
    const dispatch = useAppDispatch()
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
                        {entry.name || <span className="text-slate-400 font-normal italic">Unnamed certification</span>}
                    </p>
                    {entry.organization && (
                        <p className="text-xs text-slate-500 truncate">
                            {entry.organization}{entry.date ? ` · ${entry.date}` : ""}
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
                                label="Certification Name"
                                value={entry.name}
                                onChange={(v) => onUpdate({ name: v })}
                                placeholder="AWS Certified Solutions Architect"
                            />
                        </div>
                        <div className="col-span-2">
                            <Field
                                label="Issuing Organization"
                                value={entry.organization}
                                onChange={(v) => onUpdate({ organization: v })}
                                placeholder="Amazon Web Services"
                            />
                        </div>
                        <div className="col-span-2">
                            <Field
                                label="Date"
                                value={entry.date}
                                onChange={(v) => onUpdate({ date: v })}
                                placeholder="Jun 2023"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
