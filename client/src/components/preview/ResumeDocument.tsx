import type { ResumeTemplate, Resume, ResumeVisibility } from "../../types/resume";
import type { OrderableSection } from "../../slices/resumeSlice";
import { ModernResumeTemplate } from "./ModernResumeTemplate";
import { ClassicResumeTemplate } from "./ClassicResumeTemplate";

interface ResumeDocumentProps {
    resume: Resume;
    visibility: ResumeVisibility;
    order: Array<OrderableSection>
    template: ResumeTemplate
    interactive?: boolean
}

export const ResumeDocument = ({
    resume,
    visibility,
    order,
    template,
    interactive=true,
}: ResumeDocumentProps) => {
    if (template === "modern"){
        return (
            <ModernResumeTemplate
                resume={resume}
                interactive={interactive}
                visibility={visibility}
                order={order}
            />
        )
    }
    else if (template === "classic"){
        return (
            <ClassicResumeTemplate
                resume={resume}
                interactive={interactive}
                visibility={visibility}
                order={order}
            />
        )
    }
}
