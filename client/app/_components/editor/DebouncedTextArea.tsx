"use client"

import React from "react"
import { useCommit } from "../../_lib/hooks/useCommit"

interface TextAreaProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}
 
export const DebouncedTextArea: React.FC<TextAreaProps> = ({
    value,
    onChange,
    placeholder,
    rows = 4,
    className = "",
}) => {
    const { local, handleChange, flush } = useCommit(value, onChange)
    const defaultClass = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors resize-none leading-relaxed"
 
    return (
        <textarea
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={flush}
            placeholder={placeholder}
            rows={rows}
            className={`${defaultClass} ${className ?? ""}`}
        />
    );
};
