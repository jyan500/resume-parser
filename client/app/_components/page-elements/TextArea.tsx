"use client"

import React from "react"
import { useFormContext, type RegisterOptions } from "react-hook-form"

interface TextAreaProps {
    name: string
    placeholder?: string;
    registerOptions: RegisterOptions
    rows?: number;
    className?: string;
}
 
export const TextArea: React.FC<TextAreaProps> = ({
    name,
    placeholder,
    rows = 4,
    registerOptions,
    className = "",
}) => {
    const { register, formState: {errors} } = useFormContext();
    const defaultClass = `w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors resize-none leading-relaxed
            ${
                errors[name]
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:border-brand-accent focus:ring-brand-accent/40"
            }
    ` 
    return (
        <textarea
            rows={rows}
            placeholder={placeholder}
            className={`${defaultClass} ${className ?? ""}`}
            {...register(name, registerOptions)}
        />
    );
};
