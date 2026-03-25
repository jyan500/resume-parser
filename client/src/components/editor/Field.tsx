import React from "react"
import { DebouncedInput } from "./DebouncedInput";

 
type FieldProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    inlineItem?: React.ReactNode,
} & Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange">
 
export const Field: React.FC<FieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    inlineItem,
    type = "text",
    ...inputProps
}) => {
 
    return (
        <div className="flex flex-col gap-1">
            {
                inlineItem ? (
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-500">{label}</label>
                        {inlineItem}
                    </div>
                ) : (
                    <label className="text-xs font-medium text-slate-500">{label}</label>
                )
            }
            <DebouncedInput
                {...inputProps}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
};
