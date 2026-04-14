import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { dismissSuggestion, updateBullet, setFocusedRegionId } from "../../slices/resumeSlice";
import type { ContainsBullets } from "../../slices/resumeSlice";
import { TextArea } from "./TextArea";
import type { Bullet as BulletType, SuggestedBullet } from "../../types/resume";
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion"

interface Bullet {
    bullet: BulletType;
    /** The entry this bullet belongs to — needed to dispatch updateBullet correctly */
    section: ContainsBullets;
    entryId: string;
    /** Populated when the AI returned a suggestion whose id matches this bullet */
    suggestion?: SuggestedBullet;
    onRemoveBullet: () => void;
    onToggleBullet: () => void;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export const Bullet: React.FC<Bullet> = ({
    bullet,
    section,
    entryId,
    suggestion,
    onRemoveBullet,
    onToggleBullet,
    dragHandleProps,
}) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // When the Target Job panel signals this bullet should be focused,
    // scroll it into view and briefly highlight it, then clear the signal.
    useScrollToFocusedRegion(rootRef, bullet.id, () => setOpen(!!suggestion))

    const handleTextChange = (text: string) => {
        dispatch(updateBullet({ section, entryId, bulletId: bullet.id, text }));
    };

    const handleApply = () => {
        if (!suggestion) return;
        dispatch(updateBullet({ section, entryId, bulletId: bullet.id, text: suggestion.newText }));
        dispatch(dismissSuggestion(bullet.id));
        setOpen(false);
    };

    const handleDismiss = () => {
        dispatch(dismissSuggestion(bullet.id));
        setOpen(false);
    };

    return (
        <div
            ref={rootRef}
            className={`rounded-lg transition-all duration-150 ${
                open ? "bg-blue-50/50 ring-1 ring-blue-200 p-1.5" : ""
            }`}
        >
            {/* ── Bullet row ── */}
            <div className="flex items-start gap-2">
                {/* Drag handle */}
                <button
                    className="mt-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                    aria-label="Drag to reorder"
                    {...dragHandleProps}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                </button>

                {/* Enabled toggle */}
                <button
                    onClick={onToggleBullet}
                    className={`mt-2 w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                        bullet.enabled
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-300"
                    }`}
                />

                {/* Textarea — writes through dispatch so Apply can also write here */}
                <TextArea
                    value={bullet.text}
                    onChange={(v) => handleTextChange(v)}
                    placeholder="Describe an achievement or responsibility..."
                    rows={2}
                    className={`${
                        bullet.enabled ? "border-slate-200" : "border-slate-100 opacity-60"
                    }`}
                />

                {/* AI tip badge — only shown when a suggestion exists */}
                {suggestion && (
                    <button
                        onClick={() => setOpen((v) => !v)}
                        title={open ? "Hide suggestion" : "View AI suggestion"}
                        className={`mt-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 border ${
                            open
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                        }`}
                    >
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        tip
                    </button>
                )}

                {/* Remove bullet */}
                <button
                    onClick={onRemoveBullet}
                    className="mt-2 p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* ── Inline suggestion card (Approach B) ── */}
            {open && suggestion && (
                <div className="ml-6 mt-2 rounded-lg border border-blue-200 bg-white overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border-b border-blue-100">
                    </div>

                    {/* Suggested text */}
                    <p className="px-3 py-2.5 text-xs text-slate-700 leading-relaxed">
                        {suggestion.newText}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 px-3 pb-3">
                        <button
                            onClick={handleApply}
                            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors"
                        >
                            Apply
                        </button>
{/*                        <button
                            onClick={handleDismiss}
                            className="px-3 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                        >
                            Got it
                        </button>*/}
                        <button 
                            onClick={() => setOpen(!open)}
                            className="px-3 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
