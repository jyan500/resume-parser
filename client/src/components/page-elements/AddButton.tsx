import React from "react"

// Add button
interface AddButtonProps {
    label: string;
    onClick: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors duration-150"
    >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {label}
    </button>
);
