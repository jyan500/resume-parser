import React, { useState, useRef } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import {
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    toggleSkillCategory,
    toggleSectionVisibility,
} from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { AddButton } from "./AddButton"
import type { SkillCategory } from "../../types/resume";

export const SkillsSection: React.FC = () => {
    const dispatch = useAppDispatch();
    const skills = useAppSelector(selectResume).skills;
    const visible = useAppSelector(selectVisibility).skills;

    return (
        <SectionWrapper
            title="Skills"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("skills"))}
            rightSlot={
                <AddButton label="Add Category" onClick={() => dispatch(addSkillCategory())} />
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

interface SkillCategoryRowProps {
    skill: SkillCategory;
    onUpdate: (patch: Partial<SkillCategory>) => void;
    onRemove: () => void;
    onToggle: () => void;
}

const SkillCategoryRow: React.FC<SkillCategoryRowProps> = ({ skill, onUpdate, onRemove, onToggle }) => {
    const [tagInput, setTagInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

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
        <div className={`rounded-xl border p-3 transition-colors duration-150 ${skill.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
            {/* Category name row */}
            <div className="flex items-center gap-2 mb-2.5">
                <span className="text-slate-300 cursor-grab">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                </span>
                <button
                    onClick={onToggle}
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        skill.enabled ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                    }`}
                >
                    {skill.enabled && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    )}
                </button>
                <input
                    type="text"
                    value={skill.category}
                    onChange={(e) => onUpdate({ category: e.target.value })}
                    placeholder="Category Name"
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
                />
                <button
                    onClick={onRemove}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
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
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                        {item}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                            className="text-blue-500 hover:text-blue-800 transition-colors"
                        >
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
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
