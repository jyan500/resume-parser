import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from "@react-pdf/renderer";
import type { ExperienceEntry, ProjectEntry, Resume, ResumeVisibility } from "../../types/resume";
import type { OrderableSection } from "../../slices/resumeSlice";
import { ContactItem } from "./ContactItem"
import { SectionHeader } from "./SectionHeader"
import { BulletList } from "./BulletList"

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLORS = {
    black: "#111111",
    darkGray: "#333333",
    midGray: "#555555",
    lightGray: "#888888",
    border: "#CCCCCC",
    accent: "#1a56db",
};

const FONT = {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    oblique: "Helvetica-Oblique",
};

const SIZE = {
    name: 20,
    sectionHeader: 10,
    body: 9,
    small: 8,
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        fontFamily: FONT.normal,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        paddingTop: 36,
        paddingBottom: 48,
        paddingHorizontal: 48,
        lineHeight: 1.4,
    },

    // Header
    header: {
        marginBottom: 10,
        alignItems: "center",
        color: COLORS.black,
    },
    name: {
        fontSize: SIZE.name,
        fontFamily: FONT.bold,
        color: COLORS.black,
        letterSpacing: 1,
        marginBottom: 4,
    },
    contactRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 4,
    },
    contactText: {
        fontSize: SIZE.small,
        color: COLORS.midGray,
    },
    contactSeparator: {
        fontSize: SIZE.small,
        color: COLORS.border,
        marginHorizontal: 2,
    },
    contactLink: {
        fontSize: SIZE.small,
        color: COLORS.accent,
        textDecoration: "none",
    },

    // Section
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: SIZE.sectionHeader,
        fontFamily: FONT.bold,
        color: COLORS.black,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.black,
        borderBottomStyle: "solid",
        paddingBottom: 2,
        marginBottom: 5,
    },

    // Experience / Project entry
    entryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 1,
    },
    entryTitle: {
        fontFamily: FONT.bold,
        fontSize: SIZE.body,
        color: COLORS.black,
    },
    entryCompany: {
        fontFamily: FONT.oblique,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },
    entryDate: {
        fontSize: SIZE.small,
        color: COLORS.midGray,
        textAlign: "right",
        flexShrink: 0,
    },
    entryLocation: {
        fontSize: SIZE.small,
        color: COLORS.midGray,
        textAlign: "right",
        flexShrink: 0,
    },

    // Bullets (passed to shared BulletList)
    bulletList: {
        marginLeft: 10,
        marginTop: 2,
    },
    bulletLinkContainer: {
        textDecoration: "none"
    },
    bulletRow: {
        flexDirection: "row",
        marginBottom: 1.5,
    },
    bulletDot: {
        width: 10,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        flexShrink: 0,
    },
    bulletText: {
        flex: 1,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },

    // Education
    educationRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3,
    },
    educationLeft: {
        flex: 1,
    },
    educationSchool: {
        fontFamily: FONT.bold,
        fontSize: SIZE.body,
        color: COLORS.black,
    },
    educationDegree: {
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },
    educationGpa: {
        fontSize: SIZE.small,
        color: COLORS.midGray,
    },

    // Certifications
    certificationRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 3,
    },
    certificationName: {
        fontFamily: FONT.bold,
        fontSize: SIZE.body,
        color: COLORS.black,
    },
    certificationOrg: {
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        fontFamily: FONT.oblique,
    },

    // Skills
    skillRow: {
        flexDirection: "row",
        marginBottom: 2,
    },
    skillCategory: {
        fontFamily: FONT.bold,
        fontSize: SIZE.body,
        width: 90,
        flexShrink: 0,
        color: COLORS.black,
    },
    skillItems: {
        flex: 1,
        fontSize: SIZE.body,
        color: COLORS.darkGray,
    },

    // Summary
    summaryText: {
        fontSize: SIZE.body,
        color: COLORS.darkGray,
        lineHeight: 1.5,
    },
});

// Shared style slices passed to shared primitives
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

// ─── Section Components ───────────────────────────────────────────────────────

interface ExperienceSectionProps {
    visibility: ResumeVisibility;
    enabledExperience: Array<ExperienceEntry>;
    interactive?: boolean;
}

const ExperienceSection = ({ visibility: vis, enabledExperience, interactive }: ExperienceSectionProps) => {
    if (!vis.experience || enabledExperience.length === 0) return null;

    const entry = (exp: ExperienceEntry) => (
        <View style={styles.entryRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                <Text style={styles.entryCompany}>{exp.company}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.entryDate}>
                    {exp.startDate} – {exp.endDate}
                </Text>
                {exp.location && (
                    <Text style={styles.entryLocation}>{exp.location}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.section}>
            <SectionHeader title="Professional Experience" styles={sectionHeaderStyles} />
            {enabledExperience.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 6 }}>
                    {interactive ? (
                        <Link src={`http://r/#${exp.id}`} style={styles.bulletLinkContainer}>
                            {entry(exp)}
                        </Link>
                    ) : entry(exp)}
                    <BulletList interactive={interactive} bullets={exp.bullets} styles={bulletStyles} />
                </View>
            ))}
        </View>
    );
};

interface ProjectsSectionProps {
    visibility: ResumeVisibility;
    enabledProjects: Array<NonNullable<Resume["projects"]>[number]>;
    interactive?: boolean;
}

const ProjectsSection = ({ visibility: vis, enabledProjects, interactive }: ProjectsSectionProps) => {
    if (!vis.projects || enabledProjects.length === 0) return null;

    const projectHeader = (proj: NonNullable<Resume["projects"]>[number]) => (
        <View style={styles.entryRow}>
            <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
                <Text style={styles.entryTitle}>{proj.name}</Text>
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
    );

    return (
        <View style={styles.section}>
            <SectionHeader title="Projects" styles={sectionHeaderStyles} />
            {enabledProjects.map((proj) => (
                <View key={proj.id} style={{ marginBottom: 6 }}>
                    {interactive ? (
                        <Link src={`http://r/#${proj.id}`} style={styles.bulletLinkContainer}>
                            {projectHeader(proj)}
                        </Link>
                    ) : projectHeader(proj)}
                    <BulletList interactive={interactive} bullets={proj.bullets} styles={bulletStyles} />
                </View>
            ))}
        </View>
    );
};

interface EducationSectionProps {
    visibility: ResumeVisibility;
    enabledEducation: Resume["education"];
    interactive?: boolean;
}

const EducationSection = ({ visibility: vis, enabledEducation, interactive }: EducationSectionProps) => {
    if (!vis.education || enabledEducation.length === 0) return null;

    const eduEntry = (edu: Resume["education"][number]) => (
        <View key={edu.id} style={styles.educationRow}>
            <View style={styles.educationLeft}>
                <Text style={styles.educationSchool}>{edu.school}</Text>
                <Text style={styles.educationDegree}>
                    {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                </Text>
                {edu.gpa && (
                    <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
                )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.entryDate}>
                    {edu.startDate ? `${edu.startDate}-` : ""}{edu.endDate}
                </Text>
                {edu.location && (
                    <Text style={styles.entryLocation}>{edu.location}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.section}>
            <SectionHeader title="Education" styles={sectionHeaderStyles} />
            {enabledEducation.map((edu) => (
                interactive ? (
                    <Link key={edu.id} src={`http://r/#${edu.id}`} style={styles.bulletLinkContainer}>
                        {eduEntry(edu)}
                    </Link>
                ) : eduEntry(edu)
            ))}
        </View>
    );
};

interface CertificationSectionProps {
    visibility: ResumeVisibility;
    enabledCertifications: Resume["certifications"];
    interactive?: boolean;
}

const CertificationSection = ({ visibility: vis, enabledCertifications, interactive }: CertificationSectionProps) => {
    if (!vis.certifications || enabledCertifications.length === 0) return null;

    const certEntry = (cert: Resume["certifications"][number]) => (
        <View key={cert.id} style={styles.certificationRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationOrg}>{cert.organization}</Text>
            </View>
            {cert.date && (
                <Text style={styles.entryDate}>{cert.date}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.section}>
            <SectionHeader title="Certifications" styles={sectionHeaderStyles} />
            {enabledCertifications.map((cert) => (
                interactive ? (
                    <Link key={cert.id} src={`http://r/#${cert.id}`} style={styles.bulletLinkContainer}>
                        {certEntry(cert)}
                    </Link>
                ) : certEntry(cert)
            ))}
        </View>
    );
};

interface SkillsSectionProps {
    visibility: ResumeVisibility;
    enabledSkills: Resume["skills"];
    interactive?: boolean;
}

const SkillsSection = ({ visibility: vis, enabledSkills, interactive }: SkillsSectionProps) => {
    if (!vis.skills || enabledSkills.length === 0) return null;

    const skillRow = (skill: Resume["skills"][number]) => (
        <View key={skill.id} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{skill.category}:</Text>
            <Text style={styles.skillItems}>{skill.items.join(", ")}</Text>
        </View>
    );

    return (
        <View style={styles.section}>
            <SectionHeader title="Skills" styles={sectionHeaderStyles} />
            {enabledSkills.map((skill) => (
                interactive ? (
                    <Link key={skill.id} src={`http://r/#${skill.id}`} style={styles.bulletLinkContainer}>
                        {skillRow(skill)}
                    </Link>
                ) : skillRow(skill)
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

interface ResumeDocumentProps {
    resume: Resume;
    visibility: ResumeVisibility;
    order: Array<OrderableSection>;
    interactive?: boolean
}

export const ModernResumeTemplate: React.FC<ResumeDocumentProps> = ({
    resume,
    visibility,
    order,
    interactive,
}) => {
    const { header, summary, experience, education, certifications, skills, projects } = resume;
    const vis = visibility;

    const contactItems: { value?: string; isLink?: boolean }[] = [
        vis.header.phone ? { value: header.phone } : null,
        { value: header.email, isLink: false },
        vis.header.location ? { value: header.location } : null,
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

    const headerElement = (contactItems: Array<{value?: string; isLink?: boolean}>) => {
            return (
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
            </View>
        )
    }

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* ── Header ── */}
                {interactive ? 
                    <Link src={`http://r/#${header.id}`} style={styles.bulletLinkContainer}>
                        {headerElement(contactItems)}
                    </Link>
                    : headerElement(contactItems)
                } 

                {/* ── Summary ── */}
                {vis.summary && summary && summary.text !== "" && (
                    <View style={styles.section}>
                        <SectionHeader title="Summary" styles={sectionHeaderStyles} />
                        {
                            interactive ? 
                                <Link src={`http://r/#${summary.id}`} style={styles.bulletLinkContainer}>
                                    <Text style={styles.summaryText}>{summary.text}</Text>
                                </Link>
                            :
                            <Text style={styles.summaryText}>{summary.text}</Text>
                        }
                    </View>
                )}

                {order.map((section) => {
                    switch (section) {
                        case "experience":
                            return <ExperienceSection interactive={interactive} key="resume-experience" {...sectionProps.experience} />;
                        case "projects":
                            return <ProjectsSection interactive={interactive} key="resume-projects" {...sectionProps.projects} />;
                        case "education":
                            return <EducationSection interactive={interactive} key="resume-education" {...sectionProps.education} />;
                        case "certifications":
                            return <CertificationSection interactive={interactive} key="resume-certifications" {...sectionProps.certifications} />;
                        case "skills":
                            return <SkillsSection interactive={interactive} key="resume-skills" {...sectionProps.skills} />;
                    }
                })}

            </Page>
        </Document>
    );
};
