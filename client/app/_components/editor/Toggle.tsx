"use client"

import React from "react"

// Toggle switch
interface ToggleProps {
    enabled: boolean;
    onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
            enabled ? "bg-brand-accent" : "bg-slate-200"
        }`}
        role="switch"
        aria-checked={enabled}
    >
        <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
        />
    </button>
);

