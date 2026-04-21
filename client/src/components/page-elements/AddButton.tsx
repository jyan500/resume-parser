import React from "react"
import { Plus } from "lucide-react"

// Add button
interface AddButtonProps {
    label: string;
    onClick: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({ label, onClick }) => (
    <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className="flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-1.5 transition-colors duration-150"
    >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
    </button>
);
