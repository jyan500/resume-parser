import React, { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../store"
import { setFocusedRegionId } from "../slices/resumeSlice"

// If a region on the resume is clicked within the live PDF preview (or the suggestion card for experience/project bullet points),
// automatically scroll to where the id of that specified region is on the editor panel
export const useScrollToFocusedRegion = (ref: HTMLDivElement,currentRegionId: number, openCard?: () => void) => {
    const dispatch = useAppDispatch()
    const focusedRegionId = useAppSelector((s) => s.resume.focusedRegionId);

    useEffect(() => {
        if (focusedRegionId !== currentRegionId) return;
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (openCard){
            openCard()
        }
        // setOpen(!!suggestion); // auto-open the suggestion card if one exists
        dispatch(setFocusedRegionId(null)); // clear so it doesn't retrigger
    }, [focusedRegionId, currentRegionId]);
}