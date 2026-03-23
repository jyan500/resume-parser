import React from "react";
import { selectOrder, useAppDispatch, useAppSelector } from "../../store";
import { HeaderSection } from "./HeaderSection";
import { SummarySection } from "./SummarySection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { CertificationSection } from "./CertificationSection";
import { DndSortableWrapper } from "../page-elements/DndSortableWrapper";
import { DndSortableWrapperPreview } from "../page-elements/DndSortableWrapperPreview";
import { updateOrder } from "../../slices/resumeSlice";
import type { OrderableSection } from "../../slices/resumeSlice";

// ─── Section map ──────────────────────────────────────────────────────────────
// Maps each orderable section key to its component. Every component in this
// map must accept an optional `dragHandleProps` prop so the section-level
// drag handle can be rendered inside the section's own header row.

type SectionDragHandleProps = React.HTMLAttributes<HTMLButtonElement>;

type OrderableSectionComponent = React.FC<{
    dragHandleProps?: SectionDragHandleProps;
}>;

const SECTION_COMPONENTS: Record<OrderableSection, OrderableSectionComponent> = {
    experience: ExperienceSection,
    projects: ProjectsSection,
    education: EducationSection,
    certifications: CertificationSection,
    skills: SkillsSection,
};

// ─── SectionShell ─────────────────────────────────────────────────────────────
// Thin intermediary consumed by DndSortableWrapperPreview.
// It receives `sectionKey` from `childProps` and `dragHandleProps` injected
// automatically by DndSortableWrapperPreview, then forwards the handle down
// into the actual section component so the handle lives inside the section's
// header row rather than floating outside it.

interface SectionShellProps {
    sectionKey: OrderableSection;
    dragHandleProps?: SectionDragHandleProps;
}

const SectionShell: React.FC<SectionShellProps> = ({ sectionKey, dragHandleProps }) => {
    const Section = SECTION_COMPONENTS[sectionKey];
    return <Section dragHandleProps={dragHandleProps} />;
};

// ─── EditorPanel ─────────────────────────────────────────────────────────────

export const EditorPanel: React.FC = () => {
    const dispatch = useAppDispatch();
    const order = useAppSelector(selectOrder);

    // DndSortableWrapper requires items with an `id` field.
    const orderItems = order.map((key) => ({ id: key }));

    return (
        <div className="flex flex-col">
            {/* Header and Summary are always fixed at the top — not orderable. */}
            <HeaderSection />
            <SummarySection />

            {/* The remaining 5 sections are freely reorderable. */}
            <DndSortableWrapper<{ id: string }>
                elements={orderItems}
                dragEndAction={(fromIndex: number, toIndex: number) => {
                    dispatch(updateOrder({ fromIndex, toIndex }));
                }}
            >
                {orderItems.map((item) => (
                    <DndSortableWrapperPreview<{ sectionKey: OrderableSection }>
                        key={item.id}
                        elementId={item.id}
                        childComponent={SectionShell}
                        childProps={{ sectionKey: item.id as OrderableSection }}
                    />
                ))}
            </DndSortableWrapper>
        </div>
    );
};
