"use client"

import React, { useState, useRef } from "react";
import { Eye, EyeOff, GripVertical, Sparkle, X } from "lucide-react";
import { Button } from "../page-elements/Button";
import { MiniButton } from "../page-elements/MiniButton";
import { useAppDispatch } from "../../_lib/store";
import { dismissSuggestion, updateBullet } from "../../_lib/slices/resumeSlice";
import type { ContainsBullets } from "../../_lib/slices/resumeSlice";
import { DebouncedTextArea } from "./DebouncedTextArea";
import type { Bullet as BulletType, SuggestedBullet } from "../../_lib/types/resume";
import { useScrollToFocusedRegion } from "../../_lib/hooks/useScrollToFocusedRegion"

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
                open ? "bg-brand-subtle/50 ring-1 ring-brand-border p-1.5" : ""
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
                    <GripVertical className="w-3.5 h-3.5" strokeWidth={2} />
                </button>

                {/* Enabled toggle */}
                <button
                    onClick={onToggleBullet}
                    className="mt-2 flex-shrink-0 transition-colors text-slate-400 hover:text-slate-600"
                    aria-label={bullet.enabled ? "Hide bullet" : "Show bullet"}
                >
                    {bullet.enabled
                        ? <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                        : <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
                    }
                </button>

                {/* Textarea — writes through dispatch so Apply can also write here */}
                <DebouncedTextArea
                    value={bullet.text}
                    onChange={(v) => handleTextChange(v)}
                    placeholder="Describe an achievement or responsibility..."
                    rows={4}
                    className={`${
                        bullet.enabled ? "border-slate-200" : "border-slate-100 opacity-60"
                    }`}
                />

                {/* AI tip badge — only shown when a suggestion exists */}
                {suggestion && (
                    <MiniButton
                        onClick={() => setOpen((v) => !v)}
                        label={open ? "Hide suggestion" : "View AI suggestion"}
                        icon={<Sparkle className="w-4 h-4" />}
                        active={open}
                        className="mt-2 flex-shrink-0"
                    />
                )}

                {/* Remove bullet */}
                <button
                    onClick={onRemoveBullet}
                    className="mt-2 p-0.5 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
            </div>

            {/* ── Inline suggestion card (Approach B) ── */}
            {open && suggestion && (
                <div className="ml-6 mt-2 rounded-lg border border-brand-border bg-white overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-subtle border-b border-brand-border">
                    </div>

                    {/* Suggested text */}
                    <p className="px-3 py-2.5 text-xs text-slate-700 leading-relaxed">
                        {suggestion.newText}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 px-3 pb-3">
                        <Button variant="primary" onClick={handleApply}>Apply</Button>
                        <Button variant="secondary" onClick={() => handleDismiss()}>Dismiss</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
