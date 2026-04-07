import React, {useRef} from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import { updateHeader, toggleHeaderField } from "../../slices/resumeSlice";
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
        <SectionWrapper ref={rootRef} title="Resume Header">
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
                {/* <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Location</label>
                    <button
                        onClick={() => dispatch(toggleHeaderField("location"))}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                            vis.location
                                ? "text-slate-500 hover:text-slate-700"
                                : "text-slate-400 line-through"
                        }`}
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            {vis.location ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            )}
                        </svg>
                        {vis.location ? "Hide Location" : "Show Location"}
                    </button>
                </div>
                <input
                    type="text"
                    value={header.location}
                    onChange={(e) => patch({ location: e.target.value })}
                    placeholder="San Francisco, CA, USA"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
                /> */}
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
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                {vis.location ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                )}
                            </svg>
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
                            {/* <input
                                type="url"
                                value={url}
                                onChange={(e) => {
                                    const updated = [...(header.urls ?? [])];
                                    updated[i] = e.target.value;
                                    patch({ urls: updated });
                                }}
                                placeholder="https://linkedin.com/in/you"
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
                            /> */}
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
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => patch({ urls: [...(header.urls ?? []), ""] })}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
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
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            )}
        </svg>
        {visible ? "Hide" : "Show"} {label}
    </button>
);
