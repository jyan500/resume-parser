"use client"

import React from "react"
import { useFormContext, type RegisterOptions } from "react-hook-form"

type Props = {
    name: string;
    registerOptions?: RegisterOptions;
    placeholder?: string;
    type?: string;
} & Omit<React.ComponentPropsWithoutRef<"input">, "name">

export const Input = ({
    name,
    registerOptions,
    placeholder,
    type = "text",
    ...inputProps
}: Props) => {
    const { register, formState: {errors} } = useFormContext();
    return (
        <input
            className={`
                w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors
                ${
                    errors[name]
                    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                    : "border-slate-200 focus:border-brand-accent focus:ring-brand-accent/40"
                }
            `}
            type={type}
            placeholder={placeholder}
            {...register(name, registerOptions)}
            {...inputProps}
        />
    )
}
