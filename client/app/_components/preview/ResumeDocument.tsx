"use client"

import type { ResumeTemplate, Resume, ResumeVisibility, SectionTitles } from "../../_lib/types/resume";
import type { SectionOrder } from "../../_lib/slices/resumeSlice";
import { ModernResumeTemplate } from "./ModernResumeTemplate";
import { ClassicResumeTemplate } from "./ClassicResumeTemplate";
import { TwoColumnResumeTemplate } from "./TwoColumnResumeTemplate";

interface ResumeDocumentProps {
    resume: Resume;
    visibility: ResumeVisibility;
    order: SectionOrder
    template: ResumeTemplate
    interactive?: boolean
    sectionTitles: SectionTitles
}

export const ResumeDocument = ({
    resume,
    visibility,
    order,
    template,
    interactive=true,
    sectionTitles,
}: ResumeDocumentProps) => {
    if (template === "modern"){
        return (
            <ModernResumeTemplate
                resume={resume}
                interactive={interactive}
                visibility={visibility}
                order={order.right}
                sectionTitles={sectionTitles}
            />
        )
    }
    else if (template === "classic"){
        return (
            <ClassicResumeTemplate
                resume={resume}
                interactive={interactive}
                visibility={visibility}
                order={order.right}
                sectionTitles={sectionTitles}
            />
        )
    }
    else if (template === "twoColumn"){
        return (
            <TwoColumnResumeTemplate
                resume={resume}
                interactive={interactive}
                visibility={visibility}
                leftOrder={order.left}
                rightOrder={order.right}
                sectionTitles={sectionTitles}
            />
        )
    }
}
