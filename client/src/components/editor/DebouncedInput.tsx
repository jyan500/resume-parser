import React from "react"
import { useCommit } from "../../hooks/useCommit"

// Local state drives the input for instant visual feedback.
// Redux is only updated after the debounceTime passes,
// OR if the user leaves the field before the debounceTime passes,
// it will flush to the redux state

type Props = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
} & Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange">

export const  DebouncedInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    ...inputProps
}: Props) => {
    const { local, handleChange, flush } = useCommit(value, onChange);
    const { onBlur: callerOnBlur, ...restInputProps } = inputProps;
    return (
        <input
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-colors"
            {...restInputProps}
            type={type}
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={(e) => { flush(); callerOnBlur?.(e); }}
            placeholder={placeholder}
        />
    )
}
