import React, { useState } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    type ContainsBullets,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    toggleExperience,
    addBullet,
    updateBullet,
    removeBullet,
    toggleBullet,
    toggleSectionVisibility,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { AddButton } from "../page-elements/AddButton";
import type { ExperienceEntry } from "../../types/resume";
import { DndSortableWrapper } from "../page-elements/DndSortableWrapper";
import { DndSortableWrapperPreview } from "../page-elements/DndSortableWrapperPreview"

export const ExperienceSection: React.FC = () => {
    const dispatch = useAppDispatch();
    const experience = useAppSelector(selectResume).experience;
    const visible = useAppSelector(selectVisibility).experience;

    return (
        <SectionWrapper
            title="Professional Experience"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("experience"))}
            rightSlot={
                <AddButton label="Add Experience" onClick={() => dispatch(addExperience())} />
            }
        >
            {experience.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                    No experience added yet.
                </p>
            )}

            {/* 
                closestCenter means that when the user drags an item over a list of
                droppable targets, dnd will determine the dropping target based on the distance
                from the center point of the dragged item to the center of every droppable target,
                and picks the target with the closest distance. 
            */}
            <DndSortableWrapper<ExperienceEntry>
                elements={experience}
                dragEndAction={(fromIndex: number, toIndex: number) => {
                    dispatch(reorderExperience({fromIndex, toIndex}))
                }}
            >
                {experience.map((exp) => {
                    const payload = {
                        section: "experience" as ContainsBullets,
                        entryId: exp.id,
                    };
                    return (
                        <DndSortableWrapperPreview
                            key={exp.id}
                            elementId={exp.id}
                            childComponent={ExperienceEntryCard}
                            childProps={{
                                entry: exp,
                                onUpdate: (patch) => {
                                    dispatch(updateExperience({ id: exp.id, patch }))
                                },
                                onRemove: () => dispatch(removeExperience(exp.id)),
                                onToggle: () => dispatch(toggleExperience(exp.id)),
                                onAddBullet: () => dispatch(addBullet(payload)),
                                onUpdateBullet: (bulletId, text) => {
                                    dispatch(updateBullet({ ...payload, bulletId, text }))
                                },
                                onRemoveBullet: (bulletId) => {
                                    dispatch(removeBullet({ ...payload, bulletId }))
                                },
                                onToggleBullet: (bulletId) => {
                                    dispatch(toggleBullet({ ...payload, bulletId }))
                                },
                            } as ExperienceEntryProps}
                        />
                    );
                })}
            </DndSortableWrapper>
        </SectionWrapper>
    );
};

interface ExperienceEntryProps {
    entry: ExperienceEntry;
    onUpdate: (patch: Partial<ExperienceEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
    onAddBullet: () => void;
    onUpdateBullet: (bulletId: string, text: string) => void;
    onRemoveBullet: (bulletId: string) => void;
    onToggleBullet: (bulletId: string) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}
 
const ExperienceEntryCard: React.FC<ExperienceEntryProps> = ({
    entry,
    onUpdate,
    onRemove,
    onToggle,
    onAddBullet,
    onUpdateBullet,
    onRemoveBullet,
    onToggleBullet,
    dragHandleProps,
}) => {
    const [expanded, setExpanded] = useState(true);
 
    return (
        <div
            className={`rounded-xl border transition-colors duration-150 ${
                entry.enabled
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50 opacity-60"
            }`}
        >
            {/* Entry header */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                {/* Drag handle — listeners scoped here so clicking other
                    buttons in the card never accidentally starts a drag. */}
                <button
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                    aria-label="Drag to reorder"
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
 
                {/* Enable toggle */}
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        entry.enabled
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-300"
                    }`}
                >
                    {entry.enabled && (
                        <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                            />
                        </svg>
                    )}
                </button>
 
                {/* Title / company summary */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                        {entry.title || (
                            <span className="text-slate-400 font-normal italic">
                                Untitled role
                            </span>
                        )}
                    </p>
                    {entry.company && (
                        <p className="text-xs text-slate-500 truncate">{entry.company}</p>
                    )}
                </div>
 
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onRemove}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                expanded ? "rotate-0" : "-rotate-90"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </button>
                </div>
            </div>
 
            {/* Expanded fields */}
            {expanded && (
                <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <Field
                            label="Job Title"
                            value={entry.title}
                            onChange={(v) => onUpdate({ title: v })}
                            placeholder="Software Engineer"
                        />
                        <Field
                            label="Company"
                            value={entry.company}
                            onChange={(v) => onUpdate({ company: v })}
                            placeholder="Acme Corp"
                        />
                        <Field
                            label="Start Date"
                            value={entry.startDate}
                            onChange={(v) => onUpdate({ startDate: v })}
                            placeholder="Jan 2022"
                        />
                        <Field
                            label="End Date"
                            value={entry.endDate}
                            onChange={(v) => onUpdate({ endDate: v })}
                            placeholder="Present"
                        />
                        <div className="col-span-2">
                            <Field
                                label="Location"
                                value={entry.location ?? ""}
                                onChange={(v) => onUpdate({ location: v })}
                                placeholder="San Francisco, CA"
                            />
                        </div>
                    </div>
 
                    {/* Bullets */}
                    <div className="mt-3">
                        <label className="text-xs font-medium text-slate-500 mb-2 block">
                            Bullet Points
                        </label>
                        <div className="flex flex-col gap-1.5">
                            {entry.bullets.map((bullet) => (
                                <div key={bullet.id} className="flex items-start gap-2">
                                    <button
                                        onClick={() => onToggleBullet(bullet.id)}
                                        className={`mt-2 w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                            bullet.enabled
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-white border-slate-300"
                                        }`}
                                    />
                                    <textarea
                                        value={bullet.text}
                                        onChange={(e) =>
                                            onUpdateBullet(bullet.id, e.target.value)
                                        }
                                        placeholder="Describe an achievement or responsibility..."
                                        rows={2}
                                        className={`flex-1 rounded-lg border bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors resize-none leading-relaxed ${
                                            bullet.enabled
                                                ? "border-slate-200"
                                                : "border-slate-100 opacity-60"
                                        }`}
                                    />
                                    <button
                                        onClick={() => onRemoveBullet(bullet.id)}
                                        className="mt-2 p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18 18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onAddBullet}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 mt-2 transition-colors"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Add bullet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
