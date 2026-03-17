import React, { useState, useRef } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    type ContainsBullets,
    addProject,
    updateProject,
    removeProject,
    toggleProject,
    addBullet,
    updateBullet,
    removeBullet,
    toggleBullet,
    toggleSectionVisibility,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field";
import { AddButton } from "./AddButton";
import type { ProjectEntry } from "../../types/resume";

export const ProjectsSection: React.FC = () => {
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectResume).projects ?? [];
    const visible = useAppSelector(selectVisibility).projects;

    return (
        <SectionWrapper
            title="Projects"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("projects"))}
            rightSlot={
                <AddButton label="Add Project" onClick={() => dispatch(addProject())} />
            }
        >
            {projects.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No projects added yet.</p>
            )}
            <div className="flex flex-col gap-3">
                {projects.map((proj) => {
                    const payload = {
                        section: "projects" as ContainsBullets,
                        entryId: proj.id,
                    }
                    return (
                        <ProjectRow
                            key={proj.id}
                            project={proj}
                            onUpdate={(patch) => dispatch(updateProject({ id: proj.id, patch }))}
                            onRemove={() => dispatch(removeProject(proj.id))}
                            onToggle={() => dispatch(toggleProject(proj.id))}
                            onAddBullet={() => dispatch(addBullet(payload))}
                            onUpdateBullet={(bulletId, text) =>
                                dispatch(updateBullet({ ...payload, bulletId, text }))
                            }
                            onRemoveBullet={(bulletId) =>
                                dispatch(removeBullet({ ...payload, bulletId }))
                            }
                            onToggleBullet={(bulletId) =>
                                dispatch(toggleBullet({ ...payload, bulletId }))
                            }
                        />
                    )
                })}
            </div>
        </SectionWrapper>
    );
};

interface ProjectRowProps {
    project: ProjectEntry;
    onUpdate: (patch: Partial<ProjectEntry>) => void;
    onRemove: () => void;
    onToggle: () => void;
    onAddBullet: () => void;
    onUpdateBullet: (bulletId: string, text: string) => void;
    onRemoveBullet: (bulletId: string) => void;
    onToggleBullet: (bulletId: string) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
    project, onUpdate, onRemove, onToggle, onAddBullet, onUpdateBullet, onRemoveBullet, onToggleBullet,
}) => {
    const [expanded, setExpanded] = useState(true);
    const [techInput, setTechInput] = useState("");
    const techInputRef = useRef<HTMLInputElement>(null);

    const addTech = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return;
        const items = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        const next = [...(project.technologies ?? []), ...items.filter((s) => !(project.technologies ?? []).includes(s))];
        onUpdate({ technologies: next });
        setTechInput("");
    };

    const removeTech = (tech: string) => {
        onUpdate({ technologies: (project.technologies ?? []).filter((t) => t !== tech) });
    };

    return (
        <div className={`rounded-xl border transition-colors duration-150 ${project.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-slate-300 cursor-grab flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                </span>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        project.enabled ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                    }`}
                >
                    {project.enabled && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                        {project.name || <span className="text-slate-400 font-normal italic">Untitled project</span>}
                    </p>
                    {(project.technologies ?? []).length > 0 && (
                        <p className="text-xs text-slate-500 truncate">{project.technologies!.join(", ")}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={onRemove} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button onClick={() => setExpanded((v) => !v)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}
                            fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Fields */}
            {expanded && (
                <div className="px-3 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="col-span-2">
                            <Field
                                label="Project Name"
                                value={project.name}
                                onChange={(v) => onUpdate({ name: v })}
                                placeholder="My Awesome Project"
                            />
                        </div>
                        <div className="col-span-2">
                            <Field
                                label="URL"
                                value={project.url ?? ""}
                                onChange={(v) => onUpdate({ url: v })}
                                placeholder="https://github.com/you/project"
                            />
                        </div>
                    </div>

                    {/* Technologies */}
                    <div className="mt-3">
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Technologies</label>
                        <div
                            className="min-h-[38px] flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-text"
                            onClick={() => techInputRef.current?.focus()}
                        >
                            {(project.technologies ?? []).map((tech) => (
                                <span key={tech} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {tech}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeTech(tech); }}
                                        className="text-emerald-500 hover:text-emerald-800 transition-colors"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                            <input
                                ref={techInputRef}
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTech(techInput); }
                                    else if (e.key === "Backspace" && techInput === "" && (project.technologies ?? []).length > 0) {
                                        removeTech(project.technologies![project.technologies!.length - 1]);
                                    }
                                }}
                                onBlur={() => { if (techInput.trim()) addTech(techInput); }}
                                placeholder={(project.technologies ?? []).length === 0 ? "React, TypeScript, Node.js…" : ""}
                                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Bullets */}
                    <div className="mt-3">
                        <label className="text-xs font-medium text-slate-500 mb-2 block">Bullet Points</label>
                        <div className="flex flex-col gap-1.5">
                            {project.bullets.map((bullet) => (
                                <div key={bullet.id} className="flex items-start gap-2">
                                    <button
                                        onClick={() => onToggleBullet(bullet.id)}
                                        className={`mt-2 w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                            bullet.enabled ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                                        }`}
                                    />
                                    <textarea
                                        value={bullet.text}
                                        onChange={(e) => onUpdateBullet(bullet.id, e.target.value)}
                                        placeholder="Describe what you built or accomplished..."
                                        rows={2}
                                        className={`flex-1 rounded-lg border bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors resize-none leading-relaxed ${
                                            bullet.enabled ? "border-slate-200" : "border-slate-100 opacity-60"
                                        }`}
                                    />
                                    <button
                                        onClick={() => onRemoveBullet(bullet.id)}
                                        className="mt-2 p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={onAddBullet} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 mt-2 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add bullet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
