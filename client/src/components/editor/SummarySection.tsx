import React, { useRef } from "react";
import { useAppSelector, useAppDispatch, selectResume, selectVisibility } from "../../store";
import { setSummary, toggleSectionVisibility } from "../../slices/resumeSlice";
import { SectionWrapper } from "./SectionWrapper";
import { TextArea } from "./TextArea"
import { useScrollToFocusedRegion } from "../../hooks/useScrollToFocusedRegion";
 
export const SummarySection: React.FC = () => {
    const dispatch = useAppDispatch();
    const summary = useAppSelector(selectResume).summary;
    const visible = useAppSelector(selectVisibility).summary;
    const rootRef = useRef<HTMLDivElement>(null)

    useScrollToFocusedRegion(rootRef, summary?.id ?? "")
    console.log("summary.id: ", summary?.id)
 
    return (
        <SectionWrapper
            title="Professional Summary"
            visible={visible}
            onToggleVisibility={() => dispatch(toggleSectionVisibility("summary"))}
        >
            <div ref={rootRef}>
                <TextArea
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
