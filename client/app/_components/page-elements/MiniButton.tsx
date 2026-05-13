"use client"

import React from "react"
import { Plus } from "lucide-react"

interface MiniButtonProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    active?: boolean;
    className?: string;
}

export const MiniButton: React.FC<MiniButtonProps> = ({ label, onClick, icon, active = false, className = "" }) => (
    <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`cursor-pointer flex items-center justify-center transition-colors duration-150 border rounded-md p-1.5 ${
            active
                ? "bg-brand-accent border-brand-accent text-white"
                : "bg-brand-subtle hover:bg-brand-border border-brand-border text-brand-accent hover:text-brand-medium"
        } ${className}`}
    >
        {icon ?? <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />}
    </button>
);
