import { useCommit } from "../../hooks/useCommit"
// ─── Field ────────────────────────────────────────────────────────────────────
// Local state drives the input for instant visual feedback.
// Redux is only updated after the debounceTime passes,
// OR if the user leaves the field before the debounceTime passes,
// it will flush to the redux state
 
interface FieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}
 
export const Field: React.FC<FieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}) => {
    const { local, handleChange, flush } = useCommit(value, onChange);
 
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
                type={type}
                value={local}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={flush}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            />
        </div>
    );
};