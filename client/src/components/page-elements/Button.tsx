import React from "react"
import { LoadingSpinner } from "./LoadingSpinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary"
    size?: "sm" | "md"
    icon?: React.ReactNode
    isLoading?: boolean
    loadingText?: string
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
        "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:opacity-40 disabled:cursor-not-allowed",
    secondary:
        "border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 bg-transparent",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
}

export const Button = ({
    variant = "primary",
    size = "sm",
    icon,
    isLoading = false,
    loadingText,
    disabled,
    className = "",
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            disabled={disabled || isLoading}
            className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <LoadingSpinner />
                    {loadingText ?? children}
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    )
}
