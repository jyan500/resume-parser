import React, { useRef } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import { setSummary, toggleSectionVisibility, toggleSectionCollapseVisibility, updateSectionTitle, DEFAULT_SECTION_TITLES } from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { DebouncedTextArea } from "./DebouncedTextArea"
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion";
 
export const SummarySection: React.FC = () => {
    const dispatch = useAppDispatch();
    const summary = useAppSelector(selectResume).summary;
    const visible = useAppSelector(selectVisibility).summary;
    const sectionTitle = useAppSelector((state) => state.resume.sectionTitles.summary);
    const rootRef = useRef<HTMLDivElement>(null)

    useScrollToFocusedRegion(rootRef, summary?.id ?? "")
 
    return (
        <SectionWrapper
            sectionKey="summary"
            title={sectionTitle}
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("summary"))}
            onTitleChange={(t) => dispatch(updateSectionTitle({ key: "summary", title: t }))}
            defaultTitle={DEFAULT_SECTION_TITLES.summary}
        >
            <div ref={rootRef}>
                <DebouncedTextArea
                    value={summary?.text ?? ""}
                    onChange={(v) => {
                        if (summary){
                            dispatch(setSummary({...summary, text: v}))}
                        }
                    }
                    placeholder="Write a concise summary about your professional background, key skills, and career goals..."
                    rows={5}
                    className="border-slate-200"
                />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
                {summary?.text && summary.text.length > 0 ? `${summary.text.length} characters` : "Tip: 2–4 sentences work best"}
            </p>
        </SectionWrapper>
    );
};
