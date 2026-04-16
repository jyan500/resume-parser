import React, {useRef} from "react";
import { Eye, EyeOff, X, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import { updateHeader, toggleHeaderField, toggleSectionCollapseVisibility } from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { Field } from "./Field"
import { DebouncedInput } from "./DebouncedInput";
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion";

 
export const HeaderSection: React.FC = () => {
    const dispatch = useAppDispatch();
    const header = useAppSelector(selectResume).header;
    const vis = useAppSelector(selectVisibility).header;
    const rootRef = useRef<HTMLDivElement>(null)
    
    useScrollToFocusedRegion(rootRef, header.id)

    const patch = (p: Partial<typeof header>) => dispatch(updateHeader(p));
 
    return (
        <SectionWrapper sectionKey={"header"} ref={rootRef} title="Resume Header">
            {/* Name */}
            <div className="mb-3">
                <Field
                    label="Full Name"
                    value={header.name}
                    onChange={(v) => patch({ name: v })}
                    placeholder="Jane Smith"
                />
            </div>
 
            {/* Email */}
            <div className="mb-3">
                <Field
                    label="Email"
                    value={header.email}
                    onChange={(v) => patch({ email: v })}
                    placeholder="jane@example.com"
                    type="email"
                />
            </div>
 
            {/* Location row */}
            <div className="mb-3">
                <Field
                    label={"Location"}
                    value={header.location}
                    onChange={v => patch({location: v})}
                    placeholder={"San Francisco, CA, USA"}
                    inlineItem={
                        <button
                            onClick={() => dispatch(toggleHeaderField("location"))}
                            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                                vis.location
                                    ? "text-slate-500 hover:text-slate-700"
                                    : "text-slate-400 line-through"
                            }`}
                        >
                            {vis.location ? (
                                <Eye className="w-3 h-3" strokeWidth={2} />
                            ) : (
                                <EyeOff className="w-3 h-3" strokeWidth={2} />
                            )}
                            {vis.location ? "Hide Location" : "Show Location"}
                        </button>
                    }
                />
            </div>
 
            {/* Phone + URLs visibility pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <VisibilityPill
                    label="Phone Number"
                    visible={vis.phone}
                    onToggle={() => dispatch(toggleHeaderField("phone"))}
                />
                <VisibilityPill
                    label="URLs"
                    visible={vis.urls}
                    onToggle={() => dispatch(toggleHeaderField("urls"))}
                />
            </div>
 
            {/* Phone */}
            {vis.phone && (
                <div className="mb-3">
                    <Field
                        label="Phone"
                        value={header.phone ?? ""}
                        onChange={(v) => patch({ phone: v })}
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                    />
                </div>
            )}
 
            {/* URLs */}
            {vis.urls && (
                <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                        Links <span className="text-slate-400 font-normal">(LinkedIn, GitHub, portfolio…)</span>
                    </label>
                    {(header.urls ?? []).map((url, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <DebouncedInput
                                type="url"
                                value={url}
                                onChange={(v) => {
                                    const updated = [...(header.urls ?? [])]
                                    updated[i] = v
                                    patch({urls: updated})
                                }}
                                placeholder="https://linkedin.com/in/my-profile"
                            />
                            <button
                                onClick={() => {
                                    const updated = (header.urls ?? []).filter((_, j) => j !== i);
                                    patch({ urls: updated });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => patch({ urls: [...(header.urls ?? []), ""] })}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                        Add URL
                    </button>
                </div>
            )}
        </SectionWrapper>
    );
};
 
const VisibilityPill: React.FC<{ label: string; visible: boolean; onToggle: () => void }> = ({
    label, visible, onToggle,
}) => (
    <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
            visible
                ? "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
        }`}
    >
        {visible ? (
            <Eye className="w-3 h-3" strokeWidth={2} />
        ) : (
            <EyeOff className="w-3 h-3" strokeWidth={2} />
        )}
        {visible ? "Hide" : "Show"} {label}
    </button>
);
