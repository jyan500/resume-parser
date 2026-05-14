"use client"

import React from "react"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onChecked: (e: React.MouseEvent<HTMLButtonElement>) => void
    enabled: boolean
}

export const Checkbox = React.forwardRef<HTMLButtonElement, Props>(({onChecked, enabled, className, ...props}, _ref) => {
    return (
        <button
            {...props}
            onClick={onChecked}
            className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                enabled
                    ? "bg-brand-accent border-brand-accent"
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
