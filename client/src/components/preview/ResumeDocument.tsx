import type { ResumeTemplate, Resume, ResumeVisibility } from "../../types/resume";
import type { OrderableSection } from "../../slices/resumeSlice";
import { ModernResumeTemplate } from "./ModernResumeTemplate";
import { ClassicResumeTemplate } from "./ClassicResumeTemplate";

interface ResumeDocumentProps {
    resume: Resume;
    visibility: ResumeVisibility;
    order: Array<OrderableSection>
    template: ResumeTemplate
}

export const ResumeDocument = ({
    resume,
    visibility,
    order,
    template,
}: ResumeDocumentProps) => {
    if (template === "modern"){
        return (
            <ModernResumeTemplate
                resume={resume}
                visibility={visibility}
                order={order}
            />
        )
    }
    else if (template === "classic"){
        return (
            <ClassicResumeTemplate
                resume={resume}
                visibility={visibility}
                order={order}
            />
        )
    }
}
