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
        className={`flex items-center justify-center transition-colors duration-150 border rounded-md p-1.5 ${
            active
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 hover:text-blue-700"
        } ${className}`}
    >
        {icon ?? <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />}
    </button>
);
