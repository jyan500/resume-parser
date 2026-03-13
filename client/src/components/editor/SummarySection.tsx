import React from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import { setSummary, toggleSectionVisibility } from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
 
export const SummarySection: React.FC = () => {
    const dispatch = useAppDispatch();
    const summary = useAppSelector(selectResume).summary;
    const visible = useAppSelector(selectVisibility).summary;
 
    return (
        <SectionWrapper
            title="Professional Summary"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("summary"))}
        >
            <textarea
                value={summary}
                onChange={(e) => dispatch(setSummary(e.target.value))}
                placeholder="Write a concise summary about your professional background, key skills, and career goals..."
                rows={5}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-1.5">
                {summary && summary.length > 0 ? `${summary.length} characters` : "Tip: 2–4 sentences work best"}
            </p>
        </SectionWrapper>
    );
};
 