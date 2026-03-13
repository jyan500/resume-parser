import React from "react";
import { HeaderSection } from "./HeaderSection";
import { SummarySection } from "./SummarySection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
 
export const EditorPanel: React.FC = () => {
    return (
        <div className="flex flex-col">
            <HeaderSection />
            <SummarySection />
            <ExperienceSection />
            <ProjectsSection />
            <EducationSection />
            <SkillsSection />
        </div>
    );
};
 