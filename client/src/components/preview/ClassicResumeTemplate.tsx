/**
 * ClassicResumeTemplate.tsx
 *  - Arial font throughout (4 registered variants)
 *  - Name: 14pt bold, centered
 *  - Contact row: 11pt, no bold, centered
 *  - Everything below: 10.5pt, 1.5 line spacing
 *  - Section headers: bold only
 *  - Entry label (Title at Company, Location): bold + italic
 *  - Entry date: italic, right-aligned
 *  - Education bullet text: NOT bold
 *  - No gap between entry label and its bullet list
 *  - Single line gap between entries / sections
 */

import React from "react";
import {
    Document,
    Font,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from "@react-pdf/renderer";
import type { ExperienceEntry, Resume, ResumeVisibility } from "../../types/resume";
import type { OrderableSection } from "../../slices/resumeSlice";
import { ContactItem } from "./ContactItem";
import { SectionHeader } from "./SectionHeader";
import { BulletList } from "./BulletList";

// ─── Font Registration ────────────────────────────────────────────────────────
// Register all four Arial variants so fontWeight / fontStyle selectors work.

Font.register({
    family: "Arial",
    fonts: [
        { src: "/fonts/Arial.ttf",            fontWeight: "normal", fontStyle: "normal" },
        { src: "/fonts/Arial_Bold.ttf",       fontWeight: "bold",   fontStyle: "normal" },
        { src: "/fonts/Arial_Italic.ttf",     fontWeight: "normal", fontStyle: "italic" },
        { src: "/fonts/Arial_Bold_Italic.ttf", fontWeight: "bold",   fontStyle: "italic" },
    ],
});

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLORS = {
    black: "#000000",
    darkGray: "#222222",
    midGray: "#444444",
    border: "#999999",
    accent: "#1a56db",
};

const SIZE = {
    name: 14,     // Header name — 14pt bold
    contact: 11,  // Phone / email / location row — 11pt, no bold
    body: 10.5,   // Everything below the contact row
};

// One line at 10.5pt × 1.5 leading ≈ 16pt — used as the "Single Space Here" gap
const SINGLE_LINE_GAP = 16;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        paddingTop: 40,
        paddingBottom: 48,
        paddingHorizontal: 56,
        lineHeight: 1.6,
    },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        marginBottom: SINGLE_LINE_GAP,
        alignItems: "center",
    },
    // Name: 14pt, bold
    name: {
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "normal",
        fontSize: SIZE.name,
        color: COLORS.black,
        marginBottom: 2,
    },
    contactRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 3,
    },
    // Contact items: 12pt, NOT bold
    contactText: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.contact,
    },
    contactSeparator: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.contact,
        color: COLORS.border,
        marginHorizontal: 2,
    },
    contactLink: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.contact,
        color: COLORS.accent,
        textDecoration: "none",
    },

    // ── Sections ──────────────────────────────────────────────────────────────
    section: {
        // "Single Space Here" between top-level sections
        marginBottom: SINGLE_LINE_GAP,
    },
    // Section header: bold only, 10.5pt (same as body per spec)
    sectionHeader: {
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.black,
        marginBottom: 0,
    },

    // ── Experience entry ──────────────────────────────────────────────────────
    entryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4, 
    },
    // Entry label: bold + italic ("Bold this and nothing else" + "Italicize")
    entryInlineLabel: {
        flex: 1,
        fontFamily: "Arial",
        fontStyle: "italic",
        fontSize: SIZE.body,
        color: COLORS.black,
    },
    // Date column: italic, right-aligned
    entryDate: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "italic",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        textAlign: "right",
        flexShrink: 0,
    },

    // ── Bullets ───────────────────────────────────────────────────────────────
    bulletList: {
        marginLeft: 12,
        marginTop: 0, // "No Space Here" between entry label row and bullets
    },
    bulletLinkContainer: {
        textDecoration: "none"
    },
    bulletRow: {
        flexDirection: "row",
        marginBottom: 0,
    },
    bulletDot: {
        width: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        flexShrink: 0,
    },
    bulletText: {
        flex: 1,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },

    // ── Education / Certification bullet rows ─────────────────────────────────
    eduCertBulletRow: {
        marginLeft: 12,
        flexDirection: "row",
        marginBottom: 0,
    },
    eduCertBulletDot: {
        width: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        flexShrink: 0,
    },
    eduCertText: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        flex: 1,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },

    // ── Skills ────────────────────────────────────────────────────────────────
    skillRow: {
        flexDirection: "row",
        marginBottom: 0,
    },
    skillCategory: {
        fontFamily: "Arial",
        fontStyle: "normal",
        fontSize: SIZE.body,
        width: 100,
        flexShrink: 0,
        color: COLORS.black,
    },
    skillItems: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        flex: 1,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },

    // ── Summary ───────────────────────────────────────────────────────────────
    summaryText: {
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        lineHeight: 1.5,
    },
});

// ─── Shared style slices (passed to shared primitives) ────────────────────────

const contactStyles = {
    contactText: styles.contactText,
    contactSeparator: styles.contactSeparator,
    contactLink: styles.contactLink,
};
const sectionHeaderStyles = { sectionHeader: styles.sectionHeader };
const bulletStyles = {
    bulletList: styles.bulletList,
    bulletRow: styles.bulletRow,
    bulletDot: styles.bulletDot,
    bulletText: styles.bulletText,
    bulletLinkContainer: styles.bulletLinkContainer
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "Title at Company, Location" */
function buildEntryLabel(title: string, company?: string, location?: string): string {
    let label = title;
    if (company) label += ` at ${company}`;
    if (location) label += `, ${location}`;
    return label;
}

/** "Sept 2023 to Current" */
function buildDateRange(startDate?: string, endDate?: string): string {
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (endDate) return endDate;
    if (startDate) return startDate;
    return "";
}

// ─── Section Components ───────────────────────────────────────────────────────

interface ExperienceSectionProps {
    visibility: ResumeVisibility;
    enabledExperience: Array<ExperienceEntry>;
}

const ExperienceSection = ({ visibility: vis, enabledExperience }: ExperienceSectionProps) => {
    if (!vis.experience || enabledExperience.length === 0) return null;
    return (
        <View style={styles.section}>
            <SectionHeader title="Work History" styles={sectionHeaderStyles} />
            {enabledExperience.map((exp, i) => (
                <View
                    key={exp.id}
                    // "Single Space Here" between entries; no top gap on first entry
                    style={{ marginTop: i === 0 ? 0 : SINGLE_LINE_GAP }}
                >
                    <Link src={`http://r/#${exp.id}`} style={styles.bulletLinkContainer}>
                        <View style={styles.entryRow}>
                            <Text style={styles.entryInlineLabel}>
                                {buildEntryLabel(exp.title, exp.company, exp.location)}
                            </Text>
                            <Text style={styles.entryDate}>
                                {buildDateRange(exp.startDate, exp.endDate)}
                            </Text>
                        </View>
                    </Link>
                    {/* marginTop: 0 on bulletList = "No Space Here" */}
                    <BulletList bullets={exp.bullets} styles={bulletStyles} bulletChar="•" />
                </View>
            ))}
        </View>
    );
};

interface ProjectsSectionProps {
    visibility: ResumeVisibility;
    enabledProjects: Array<NonNullable<Resume["projects"]>[number]>;
}

const ProjectsSection = ({ visibility: vis, enabledProjects }: ProjectsSectionProps) => {
    if (!vis.projects || enabledProjects.length === 0) return null;
    return (
        <View style={styles.section}>
            <SectionHeader title="Projects" styles={sectionHeaderStyles} />
            {enabledProjects.map((proj, i) => (
                <View key={proj.id} style={{ marginTop: i === 0 ? 0 : SINGLE_LINE_GAP }}>
                    <View style={styles.entryRow}>
                        <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
                            <Text style={styles.entryInlineLabel}>{proj.name}</Text>
                            {proj.url && (
                                <Link style={styles.contactLink} src={proj.url}>↗</Link>
                            )}
                        </View>
                        {proj.technologies && proj.technologies.length > 0 && (
                            <Text style={styles.entryDate}>
                                {proj.technologies.join(", ")}
                            </Text>
                        )}
                    </View>
                    <BulletList bullets={proj.bullets} styles={bulletStyles} bulletChar="•" />
                </View>
            ))}
        </View>
    );
};

interface EducationSectionProps {
    visibility: ResumeVisibility;
    enabledEducation: Resume["education"];
}

const EducationSection = ({ visibility: vis, enabledEducation }: EducationSectionProps) => {
    if (!vis.education || enabledEducation.length === 0) return null;
    return (
        <View style={styles.section}>
            <SectionHeader title="Education" styles={sectionHeaderStyles} />
            {enabledEducation.map((edu) => {
                const degreeText = [
                    edu.degree,
                    edu.field ? `in ${edu.field}` : "",
                    edu.school ? `from ${edu.school}` : "",
                ]
                    .filter(Boolean)
                    .join(" ");

                const statusOrDate = edu.endDate ? `${edu.endDate}` : "";

                return (
                    <View key={edu.id} style={styles.eduCertBulletRow}>
                        <Text style={styles.eduCertBulletDot}>•</Text>
                        {/* justify-between: degree text left, date right */}
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                            {/* "Do NOT Bold" — plain eduCertText */}
                            <Text style={styles.eduCertText}>
                                {degreeText}
                                {edu.gpa ? `  GPA: ${edu.gpa}` : ""}
                            </Text>
                            {statusOrDate ? (
                                <Text style={styles.entryDate}>{statusOrDate}</Text>
                            ) : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

interface CertificationSectionProps {
    visibility: ResumeVisibility;
    enabledCertifications: Resume["certifications"];
}

const CertificationSection = ({ visibility: vis, enabledCertifications }: CertificationSectionProps) => {
    if (!vis.certifications || enabledCertifications.length === 0) return null;
    return (
        <View style={styles.section}>
            <SectionHeader title="Certifications" styles={sectionHeaderStyles} />
            {enabledCertifications.map((cert) => {
                const label = cert.organization
                    ? `${cert.name} from ${cert.organization}`
                    : cert.name;
                return (
                    <View key={cert.id} style={styles.eduCertBulletRow}>
                        <Text style={styles.eduCertBulletDot}>•</Text>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={styles.eduCertText}>{label}</Text>
                            <Text style={styles.entryDate}>{cert.date ? `  ${cert.date}` : ""}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

interface SkillsSectionProps {
    visibility: ResumeVisibility;
    enabledSkills: Resume["skills"];
}

const SkillsSection = ({ visibility: vis, enabledSkills }: SkillsSectionProps) => {
    if (!vis.skills || enabledSkills.length === 0) return null;
    return (
        <View style={styles.section}>
            <SectionHeader title="Skills" styles={sectionHeaderStyles} />
            {enabledSkills.map((skill) => (
                <View key={skill.id} style={styles.skillRow}>
                    <Text style={styles.skillCategory}>{skill.category}:</Text>
                    <Text style={styles.skillItems}>{skill.items.join(", ")}</Text>
                </View>
            ))}
        </View>
    );
};

// ─── Main Document ────────────────────────────────────────────────────────────

type SectionPropsByKey = {
    experience: ExperienceSectionProps;
    projects: ProjectsSectionProps;
    education: EducationSectionProps;
    certifications: CertificationSectionProps;
    skills: SkillsSectionProps;
};

interface ResumeDocumentClassicProps {
    resume: Resume;
    visibility: ResumeVisibility;
    order: Array<OrderableSection>;
}

export const ClassicResumeTemplate: React.FC<ResumeDocumentClassicProps> = ({
    resume,
    visibility,
    order,
}) => {
    const { header, summary, experience, education, certifications, skills, projects } = resume;
    const vis = visibility;

    const contactItems: { value?: string; isLink?: boolean }[] = [
        vis.header.phone ? { value: header.phone } : null,
        { value: header.email, isLink: false },
        ...(vis.header.urls
            ? header.urls.map((url) => ({ value: url, isLink: true }))
            : []),
    ].filter(Boolean) as { value?: string; isLink?: boolean }[];

    const enabledExperience = experience.filter((e) => e.enabled);
    const enabledEducation = education.filter((e) => e.enabled);
    const enabledCertifications = certifications.filter((c) => c.enabled);
    const enabledSkills = skills.filter((s) => s.enabled);
    const enabledProjects = projects?.filter((p) => p.enabled) ?? [];

    const sectionProps: SectionPropsByKey = {
        experience: { visibility: vis, enabledExperience },
        projects: { visibility: vis, enabledProjects },
        education: { visibility: vis, enabledEducation },
        certifications: { visibility: vis, enabledCertifications },
        skills: { visibility: vis, enabledSkills },
    };

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.name}>{header.name || "Your Name"}</Text>
                    <View style={styles.contactRow}>
                        {contactItems
                            .filter((item) => item.value !== "")
                            .map((item, i) => (
                                <ContactItem
                                    key={i}
                                    value={item.value}
                                    isLink={item.isLink}
                                    isFirst={i === 0}
                                    styles={contactStyles}
                                />
                            ))}
                    </View>
                    {
                        vis.header.location ? 
                        <View style={styles.contactRow}>
                            <Text style={styles.contactText}>{header.location}</Text>
                        </View>
                        : null
                    }
                </View>

                {/* ── Summary ── */}
                {vis.summary && summary && (
                    <View style={styles.section}>
                        <SectionHeader title="Summary" styles={sectionHeaderStyles} />
                        <Text style={styles.summaryText}>{summary}</Text>
                    </View>
                )}

                {order.map((section) => {
                    switch (section) {
                        case "experience":
                            return <ExperienceSection key="resume-experience" {...sectionProps.experience} />;
                        case "projects":
                            return <ProjectsSection key="resume-projects" {...sectionProps.projects} />;
                        case "education":
                            return <EducationSection key="resume-education" {...sectionProps.education} />;
                        case "certifications":
                            return <CertificationSection key="resume-certifications" {...sectionProps.certifications} />;
                        case "skills":
                            return <SkillsSection key="resume-skills" {...sectionProps.skills} />;
                    }
                })}

            </Page>
        </Document>
    );
};
