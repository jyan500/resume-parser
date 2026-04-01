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
    return (
        <input
            {...inputProps}
            type={type}
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={flush}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
        />
    )
}
