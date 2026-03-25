import React from "react"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onToggle: (e: React.MouseEvent) => void
    enabled: boolean
}

export const Checkbox = React.forwardRef<HTMLButtonElement, Props>(({onToggle, enabled, className, ...props}, ref) => {
    return (
        <button
            {...props}
            onClick={onToggle}
            className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                enabled
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-slate-300"
            }`}
        >
            {enabled && (
                <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                    />
                </svg>
            )}
        </button>
        )
})