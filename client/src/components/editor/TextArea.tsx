import React, {useState, useEffect} from "react"
import { useCommit } from "../../hooks/useCommit"

interface TextAreaProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}
 
export const TextArea: React.FC<TextAreaProps> = ({
    value,
    onChange,
    placeholder,
    rows = 4,
    className = "",
}) => {
    const { local, handleChange, flush } = useCommit(value, onChange)
 
    return (
        <textarea
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={flush}
            placeholder={placeholder}
            rows={rows}
            className={className}
        />
    );
};
