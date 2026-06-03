"use client"

import React, { useMemo, useRef } from "react";
import { GripVertical, Check, Sparkle, X, ChevronDown, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../_lib/store";
import {
    type ContainsBullets,
    addProject,
    updateProject,
    removeProject,
    toggleProject,
    addBullet,
    removeBullet,
    toggleBullet,
    reorderBullets,
    toggleSectionVisibility,
    setSubToggleVisibility,
    reorderProjects,
    updateSectionTitle,
    DEFAULT_SECTION_TITLES,
} from "../../_lib/slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { MiniButton } from "../page-elements/MiniButton";
import type { ProjectEntry, SuggestedBullet, Bullet as BulletType } from "../../_lib/types/resume";
import { DndSortableWrapper } from "../page-elements/DndSortableWrapper";
import { DndSortableWrapperPreview } from "../page-elements/DndSortableWrapperPreview";
import { useScrollToFocusedRegion } from "../../_lib/hooks/useScrollToFocusedRegion";
import { BulletShell, type BulletShellProps } from "./ExperienceSection"

// ─── Section ──────────────────────────────────────────────────────────────────

interface ProjectsSectionProps {
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ dragHandleProps }) => {
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectResume).projects ?? [];
    const visible = useAppSelector(selectVisibility).projects;
    const sectionTitle = useAppSelector((state) => state.resume.sectionTitles.projects);

    const suggestedBullets = useAppSelector((s) => s.resume.suggestions.suggestedBullets);
    const suggestionsMap = useMemo<Map<string, SuggestedBullet>>(
        () => new Map(suggestedBullets.map((sb) => [sb.id, sb])),
        [suggestedBullets],
    );

    return (
        <SectionWrapper
            title={sectionTitle}
            sectionKey="projects"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("projects"))}
            onTitleChange={(t) => dispatch(updateSectionTitle({ key: "projects", title: t }))}
            defaultTitle={DEFAULT_SECTION_TITLES.projects}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <MiniButton label="Add Project" onClick={() => dispatch(addProject())} />
            }
        >
            {projects.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No projects added yet.</p>
            )}
            <DndSortableWrapper<ProjectEntry>
                elements={projects}
                dragEndAction={(fromIndex, toIndex) =>
                    dispatch(reorderProjects({ fromIndex, toIndex }))
                }
            >
                {projects.map((proj) => {
                    const payload = { section: "projects" as ContainsBullets, entryId: proj.id };
                    return (
                        <DndSortableWrapperPreview
                            key={proj.id}
                            elementId={proj.id}
                            childComponent={ProjectRow}
                            childProps={{
                                project: proj,
                                suggestionsMap,
                                onUpdate: (patch) =>
                                    dispatch(updateProject({ id: proj.id, patch })),
                                onRemove: () => dispatch(removeProject(proj.id)),
                                onToggle: () => dispatch(toggleProject(proj.id)),
                                onAddBullet: () => dispatch(addBullet(payload)),
                                onRemoveBullet: (bulletId) =>
                                    dispatch(removeBullet({ ...payload, bulletId })),
                                onToggleBullet: (bulletId) =>
                                    dispatch(toggleBullet({ ...payload, bulletId })),
                                onReorderBullets: (fromIndex, toIndex) =>
                                    dispatch(reorderBullets({ ...payload, fromIndex, toIndex })),
                            } as ProjectRowProps}
                        />
                    );
                })}
            </DndSortableWrapper>
        </SectionWrapper>
    );
};

// ─── Entry card ───────────────────────────────────────────────────────────────

interface ProjectRowProps {
    project: ProjectEntry;
    suggestionsMap: Map<string, SuggestedBullet>;
    onUpdate: (patch: Partial<ProjectEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
    onAddBullet: () => void;
    onRemoveBullet: (bulletId: string) => void;
    onToggleBullet: (bulletId: string) => void;
    onReorderBullets: (fromIndex: number, toIndex: number) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
    project, suggestionsMap, onUpdate, onRemove, onToggle, onAddBullet,
    onRemoveBullet, onToggleBullet, onReorderBullets, dragHandleProps,
}) => {
    const dispatch = useAppDispatch();
    // const [expanded, setExpanded] = useState(true);
    const { subToggleVisibility } = useAppSelector((state) => state.resume)
    const rootRef = useRef<HTMLDivElement>(null)

    const pendingCount = project.bullets.filter((b) => suggestionsMap.has(b.id)).length;

    useScrollToFocusedRegion(rootRef, project.id)

    return (
        <div ref={rootRef} className={`rounded-xl border transition-colors duration-150 ${project.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {/* ── Header ── */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                    className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                    aria-label="Drag to reorder"
                    {...dragHandleProps}
                >
                    <GripVertical className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        project.enabled ? "bg-brand-accent border-brand-accent" : "bg-white border-slate-300"
                    }`}
                >
                    {project.enabled && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                </button>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                            {project.name || <span className="text-slate-400 font-normal italic">Untitled project</span>}
                        </p>
                    </div>

                    {/* Pending suggestions pill — only when collapsed */}
                    {!subToggleVisibility[project.id] && pendingCount > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-subtle border border-brand-border text-brand-accent text-xs font-medium flex-shrink-0">
                            <Sparkle className="w-2.5 h-2.5" />
                            {pendingCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={onRemove} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <button onClick={() => dispatch(setSubToggleVisibility({regionId: project.id, isOpen: !subToggleVisibility[project.id]}))} className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${subToggleVisibility[project.id] ? "rotate-0" : "-rotate-90"}`}
                            strokeWidth={2.5}
                        />
                    </button>
                </div>
            </div>

            {/* ── Fields ── */}
            {subToggleVisibility[project.id] && (
                <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="col-span-2">
                            <Field label="Project Name" value={project.name} onChange={(v) => onUpdate({ name: v })} placeholder="Project Name" />
                        </div>
                        <div className="col-span-2">
                            <Field label="URL" value={project.url ?? ""} onChange={(v) => onUpdate({ url: v })} placeholder="URL (https://, www.)" />
                        </div>
                    </div>

                    {/* ── Bullets ── */}
                    <div className="mt-3">
                        <label className="text-xs font-medium text-slate-500 mb-2 block">Bullet Points</label>
                        <div className="flex flex-col gap-1.5">
                            <DndSortableWrapper<BulletType>
                                elements={project.bullets}
                                dragEndAction={onReorderBullets}
                            >
                                {project.bullets.map((bullet) => (
                                    <DndSortableWrapperPreview
                                        key={bullet.id}
                                        elementId={bullet.id}
                                        childComponent={BulletShell}
                                        childProps={{
                                            bullet,
                                            section: "projects",
                                            entryId: project.id,
                                            suggestion: suggestionsMap.get(bullet.id),
                                            onRemoveBullet: () => onRemoveBullet(bullet.id),
                                            onToggleBullet: () => onToggleBullet(bullet.id),
                                        } as BulletShellProps}
                                    />
                                ))}
                            </DndSortableWrapper>
                        </div>
                        <button onClick={onAddBullet} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-accent mt-2 transition-colors">
                            <Plus className="w-3 h-3" strokeWidth={2.5} />
                            Add bullet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
