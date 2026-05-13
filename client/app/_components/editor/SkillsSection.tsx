"use client"

import React, { useState, useRef } from "react";
import { GripVertical, Check, X } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../_lib/store";
import {
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    toggleSkillCategory,
    toggleSectionVisibility,
    updateSectionTitle,
    DEFAULT_SECTION_TITLES,
} from "../../_lib/slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { MiniButton } from "../page-elements/MiniButton";
import type { SkillCategory } from "../../_lib/types/resume";
import { useScrollToFocusedRegion } from "../../_lib/hooks/useScrollToFocusedRegion";

// ─── Section ──────────────────────────────────────────────────────────────────

interface SkillsSectionProps {
    // Injected by the section-level DndSortableWrapperPreview in EditorPanel.
    // Spread onto the drag handle <button> inside SectionWrapper's header.
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ dragHandleProps }) => {
    const dispatch = useAppDispatch();
    const skills = useAppSelector(selectResume).skills;
    const visible = useAppSelector(selectVisibility).skills;
    const sectionTitle = useAppSelector((state) => state.resume.sectionTitles.skills);

    return (
        <SectionWrapper
            title={sectionTitle}
            sectionKey="skills"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("skills"))}
            onTitleChange={(t) => dispatch(updateSectionTitle({ key: "skills", title: t }))}
            defaultTitle={DEFAULT_SECTION_TITLES.skills}
            dragHandleProps={dragHandleProps}
            rightSlot={
                <MiniButton label="Add Category" onClick={() => dispatch(addSkillCategory())} />
            }
        >
            {skills.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No skill categories added yet.</p>
            )}
            <div className="flex flex-col gap-3">
                {skills.map((skill) => (
                    <SkillCategoryRow
                        key={skill.id}
                        skill={skill}
                        onUpdate={(patch) => dispatch(updateSkillCategory({ id: skill.id, patch }))}
                        onRemove={() => dispatch(removeSkillCategory(skill.id))}
                        onToggle={() => dispatch(toggleSkillCategory(skill.id))}
                    />
                ))}
            </div>
        </SectionWrapper>
    );
};

// ─── Entry card ───────────────────────────────────────────────────────────────

interface SkillCategoryRowProps {
    skill: SkillCategory;
    onUpdate: (patch: Partial<SkillCategory>) => void;
    onRemove: () => void;
    onToggle: () => void;
}

const SkillCategoryRow: React.FC<SkillCategoryRowProps> = ({ skill, onUpdate, onRemove, onToggle }) => {
    const [tagInput, setTagInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef=  useRef<HTMLDivElement>(null)

    useScrollToFocusedRegion(rootRef, skill.id)

    const addItem = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return;
        // Handle comma-separated pastes
        const items = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        const next = [...skill.items, ...items.filter((s) => !skill.items.includes(s))];
        onUpdate({ items: next });
        setTagInput("");
    };

    const removeItem = (item: string) => {
        onUpdate({ items: skill.items.filter((i) => i !== item) });
    };

    return (
        <div ref={rootRef} className={`rounded-xl border p-3 transition-colors duration-150 ${skill.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {/* Category name row */}
            <div className="flex items-center gap-2 mb-2.5">
                <span className="text-slate-300 cursor-grab">
                    <GripVertical className="w-4 h-4" strokeWidth={2} />
                </span>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        skill.enabled ? "bg-brand-accent border-brand-accent" : "bg-white border-slate-300"
                    }`}
                >
                    {skill.enabled && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                </button>
                <input
                    type="text"
                    value={skill.category}
                    onChange={(e) => onUpdate({ category: e.target.value })}
                    placeholder="Category Name"
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors"
                />
                <button
                    onClick={onRemove}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Tags */}
            <div
                className="min-h-[38px] flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {skill.items.map((item) => (
                    <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-brand-subtle text-brand-medium text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                        {item}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                            className="text-brand-accent hover:text-brand-dark transition-colors"
                        >
                            <X className="w-2.5 h-2.5" strokeWidth={3} />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addItem(tagInput);
                        } else if (e.key === "Backspace" && tagInput === "" && skill.items.length > 0) {
                            removeItem(skill.items[skill.items.length - 1]);
                        }
                    }}
                    onBlur={() => { if (tagInput.trim()) addItem(tagInput); }}
                    placeholder={skill.items.length === 0 ? "Type skills, press Enter or comma…" : ""}
                    className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
                />
            </div>
            <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add · Paste comma-separated list</p>
        </div>
    );
};
