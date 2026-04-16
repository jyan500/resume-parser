import React, { useEffect, useRef, useMemo, useState } from "react";
import { GripVertical, Sparkle, X, ChevronDown, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    type ContainsBullets,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    toggleExperience,
    addBullet,
    removeBullet,
    toggleBullet,
    reorderBullets,
    toggleSectionVisibility,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
    updateSectionTitle,
    DEFAULT_SECTION_TITLES,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { AddButton } from "../page-elements/AddButton";
import { Bullet } from "./Bullet";
import type { ExperienceEntry, SuggestedBullet, Bullet as BulletType } from "../../types/resume";
import { DndSortableWrapper } from "../page-elements/DndSortableWrapper";
import { DndSortableWrapperPreview } from "../page-elements/DndSortableWrapperPreview";
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion"
import type { SectionDragHandleProps } from "./EditorPanel";

// ─── BulletShell ──────────────────────────────────────────────────────────────
// Thin intermediary consumed by DndSortableWrapperPreview for bullet reordering.
// Receives `bullet` from childProps and `dragHandleProps` injected automatically
// by DndSortableWrapperPreview.

export interface BulletShellProps {
    bullet: BulletType;
    section: ContainsBullets;
    entryId: string;
    suggestion: SuggestedBullet | undefined;
    onRemoveBullet: () => void;
    onToggleBullet: () => void;
    dragHandleProps?: SectionDragHandleProps;
}

export const BulletShell: React.FC<BulletShellProps> = ({
    bullet,
    section,
    entryId,
    suggestion,
    onRemoveBullet,
    onToggleBullet,
    dragHandleProps,
}) => {
    return (
        <Bullet
            bullet={bullet}
            section={section}
            entryId={entryId}
            suggestion={suggestion}
            onRemoveBullet={onRemoveBullet}
            onToggleBullet={onToggleBullet}
            dragHandleProps={dragHandleProps}
        />
    );
};

// ─── Section ──────────────────────────────────────────────────────────────────

interface ExperienceSectionProps {
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ dragHandleProps }) => {
    const dispatch = useAppDispatch();
    const experience = useAppSelector(selectResume).experience;
    const visible = useAppSelector(selectVisibility).experience;
    const sectionTitle = useAppSelector((state) => state.resume.sectionTitles.experience);

    // Build a bulletId → SuggestedBullet map once so every entry card can do
    // O(1) lookups
    const suggestedBullets = useAppSelector((s) => s.resume.suggestions.suggestedBullets);
    const suggestionsMap = new Map(suggestedBullets.map((sb) => [sb.id, sb]))

    return (
        <SectionWrapper
            sectionKey="experience"
            title={sectionTitle}
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("experience"))}
            onTitleChange={(t) => dispatch(updateSectionTitle({ key: "experience", title: t }))}
            defaultTitle={DEFAULT_SECTION_TITLES.experience}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <AddButton label="Add Experience" onClick={() => dispatch(addExperience())} />
            }
        >
            {experience.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                    No experience added yet.
                </p>
            )}

            <DndSortableWrapper<ExperienceEntry>
                elements={experience}
                dragEndAction={(fromIndex, toIndex) =>
                    dispatch(reorderExperience({ fromIndex, toIndex }))
                }
            >
                {experience.map((exp) => {
                    const payload = { section: "experience" as ContainsBullets, entryId: exp.id };
                    return (
                        <DndSortableWrapperPreview
                            key={exp.id}
                            elementId={exp.id}
                            childComponent={ExperienceEntryCard}
                            childProps={{
                                entry: exp,
                                suggestionsMap,
                                onUpdate: (patch) =>
                                    dispatch(updateExperience({ id: exp.id, patch })),
                                onRemove: () => dispatch(removeExperience(exp.id)),
                                onToggle: () => dispatch(toggleExperience(exp.id)),
                                onAddBullet: () => dispatch(addBullet(payload)),
                                onRemoveBullet: (bulletId) =>
                                    dispatch(removeBullet({ ...payload, bulletId })),
                                onToggleBullet: (bulletId) =>
                                    dispatch(toggleBullet({ ...payload, bulletId })),
                                onReorderBullets: (fromIndex, toIndex) =>
                                    dispatch(reorderBullets({ ...payload, fromIndex, toIndex })),
                            } as ExperienceEntryProps}
                        />
                    );
                })}
            </DndSortableWrapper>
        </SectionWrapper>
    );
};

// ─── Entry card ───────────────────────────────────────────────────────────────

interface ExperienceEntryProps {
    entry: ExperienceEntry;
    suggestionsMap: Map<string, SuggestedBullet>;
    onUpdate: (patch: Partial<ExperienceEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
    onAddBullet: () => void;
    onRemoveBullet: (bulletId: string) => void;
    onToggleBullet: (bulletId: string) => void;
    onReorderBullets: (fromIndex: number, toIndex: number) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

const ExperienceEntryCard: React.FC<ExperienceEntryProps> = ({
    entry,
    suggestionsMap,
    onUpdate,
    onRemove,
    onToggle,
    onAddBullet,
    onRemoveBullet,
    onToggleBullet,
    onReorderBullets,
    dragHandleProps,
}) => {
    const dispatch = useAppDispatch();
    const { subToggleVisibility } = useAppSelector((state) => state.resume)
    // const [expanded, setExpanded] = useState(true);
    const rootRef = useRef<HTMLDivElement>(null)

    // Count pending suggestions so we can badge the collapsed header.
    const pendingCount = entry.bullets.filter((b) => suggestionsMap.has(b.id)).length;

    useScrollToFocusedRegion(rootRef, entry.id)

    return (
        <div
            ref={rootRef}
            className={`rounded-xl border transition-colors duration-150 ${
                entry.enabled
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50 opacity-60"
            }`}
        >
            {/* ── Header ── */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                    aria-label="Drag to reorder"
                    {...dragHandleProps}
                >
                    <GripVertical className="w-4 h-4" strokeWidth={2} />
                </button>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                            {entry.title || (
                                <span className="text-slate-400 font-normal italic">Untitled role</span>
                            )}
                        </p>
                        {entry.company && (
                            <p className="text-xs text-slate-500 truncate">{entry.company}</p>
                        )}
                    </div>

                    {/* Pending suggestions pill — only when collapsed */}
                    {!subToggleVisibility[entry.id] && pendingCount > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium flex-shrink-0">
                            <Sparkle className="w-2.5 h-2.5" />
                            {pendingCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onRemove}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => dispatch(setSubToggleVisibility({regionId: entry.id, isOpen: !subToggleVisibility[entry.id]}))}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${subToggleVisibility[entry.id] ? "rotate-0" : "-rotate-90"}`}
                            strokeWidth={2.5}
                        />
                    </button>
                </div>
            </div>

            {/* ── Expanded fields ── */}
            {subToggleVisibility[entry.id] && (
                <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <Field label="Job Title" value={entry.title} onChange={(v) => onUpdate({ title: v })} placeholder="Software Engineer" />
                        <Field label="Company" value={entry.company} onChange={(v) => onUpdate({ company: v })} placeholder="Acme Corp" />
                        <Field label="Start Date" value={entry.startDate} onChange={(v) => onUpdate({ startDate: v })} placeholder="Jan 2022" />
                        <Field label="End Date" value={entry.endDate} onChange={(v) => onUpdate({ endDate: v })} placeholder="Present" />
                        <div className="col-span-2">
                            <Field label="Location" value={entry.location ?? ""} onChange={(v) => onUpdate({ location: v })} placeholder="San Francisco, CA" />
                        </div>
                    </div>

                    {/* ── Bullets ── */}
                    <div className="mt-3">
                        <label className="text-xs font-medium text-slate-500 mb-2 block">
                            Bullet Points
                        </label>
                        <div className="flex flex-col gap-1.5">
                            <DndSortableWrapper<BulletType>
                                elements={entry.bullets}
                                dragEndAction={onReorderBullets}
                            >
                                {entry.bullets.map((bullet) => {
                                    return (
                                        <DndSortableWrapperPreview
                                            key={bullet.id}
                                            elementId={bullet.id}
                                            childComponent={BulletShell}
                                            childProps={{
                                                bullet,
                                                section: "experience",
                                                entryId: entry.id,
                                                suggestion: suggestionsMap.get(bullet.id),
                                                onRemoveBullet: () => onRemoveBullet(bullet.id),
                                                onToggleBullet: () => onToggleBullet(bullet.id),
                                            } as BulletShellProps}
                                        />
                                    )
                                })}
                            </DndSortableWrapper>
                        </div>
                        <button
                            onClick={onAddBullet}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 mt-2 transition-colors"
                        >
                            <Plus className="w-3 h-3" strokeWidth={2.5} />
                            Add bullet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
