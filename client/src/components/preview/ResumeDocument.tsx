import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from "@react-pdf/renderer";
import type { Resume, ResumeVisibility } from "../../types/resume";

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

    // Bullets
    bulletList: {
        marginLeft: 10,
        marginTop: 2,
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

interface ContactItemProps {
    value?: string;
    isLink?: boolean;
    isFirst?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ value, isLink, isFirst }) => {
    if (!value) return null;
    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {!isFirst && <Text style={styles.contactSeparator}>|</Text>}
            {isLink ? (
                <Link style={styles.contactLink} src={value}>
                    {value.replace(/^https?:\/\//, "")}
                </Link>
            ) : (
                <Text style={styles.contactText}>{value}</Text>
            )}
        </View>
    );
};

// ─── Main Document ────────────────────────────────────────────────────────────

interface ResumeDocumentProps {
    resume: Resume;
    visibility: ResumeVisibility;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
    resume,
    visibility,
}) => {
    const { header, summary, experience, education, certifications, skills, projects } = resume;
    const vis = visibility;

    const contactItems: { value?: string; isLink?: boolean }[] = [
        vis.header.phone ? { value: header.phone } : null,
        vis.header.location ? { value: header.location } : null,
        { value: header.email, isLink: false },
        ...(vis.header.urls ? header.urls.map((url) => {
            return {
                value: url, isLink: true
            }
        }) : [])
    ].filter(Boolean) as { value?: string; isLink?: boolean }[];

    const enabledExperience = experience.filter((e) => e.enabled);
    const enabledEducation = education.filter((e) => e.enabled);
    const enabledCertifications = certifications.filter((c) => c.enabled);
    const enabledSkills = skills.filter((s) => s.enabled);
    const enabledProjects = projects?.filter((p) => p.enabled) ?? [];

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.name}>{header.name || "Your Name"}</Text>
                    <View style={styles.contactRow}>
                        {contactItems.filter((item) => item.value !== "").map((item, i) => (
                            <ContactItem
                                key={i}
                                value={item.value}
                                isLink={item.isLink}
                                isFirst={i === 0}
                            />
                        ))}
                    </View>
                </View>

                {/* ── Summary ── */}
                {vis.summary && summary && (
                    <View style={styles.section}>
                        <SectionHeader title="Summary" />
                        <Text style={styles.summaryText}>{summary}</Text>
                    </View>
                )}

                {/* ── Experience ── */}
                {vis.experience && enabledExperience.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Professional Experience" />
                        {enabledExperience.map((exp) => (
                            <View key={exp.id} style={{ marginBottom: 6 }}>
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
                                <View style={styles.bulletList}>
                                    {exp.bullets
                                        .filter((b) => b.enabled && b.text)
                                        .map((bullet) => (
                                            <View key={bullet.id} style={styles.bulletRow}>
                                                <Text style={styles.bulletDot}>•</Text>
                                                <Text style={styles.bulletText}>{bullet.text}</Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Projects ── */}
                {vis.projects && enabledProjects.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Projects" />
                        {enabledProjects.map((proj) => (
                            <View key={proj.id} style={{ marginBottom: 6 }}>
                                <View style={styles.entryRow}>
                                    <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
                                        <Text style={styles.entryTitle}>{proj.name}</Text>
                                        {proj.url && (
                                            <Link style={styles.contactLink} src={proj.url}>
                                                ↗
                                            </Link>
                                        )}
                                    </View>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <Text style={styles.entryDate}>
                                            {proj.technologies.join(", ")}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.bulletList}>
                                    {proj.bullets
                                        .filter((b) => b.enabled && b.text)
                                        .map((bullet) => (
                                            <View key={bullet.id} style={styles.bulletRow}>
                                                <Text style={styles.bulletDot}>•</Text>
                                                <Text style={styles.bulletText}>{bullet.text}</Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Education ── */}
                {vis.education && enabledEducation.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Education" />
                        {enabledEducation.map((edu) => (
                            <View key={edu.id} style={styles.educationRow}>
                                <View style={styles.educationLeft}>
                                    <Text style={styles.educationSchool}>{edu.school}</Text>
                                    <Text style={styles.educationDegree}>
                                        {edu.degree}
                                        {edu.field ? `, ${edu.field}` : ""}
                                    </Text>
                                    {edu.gpa && (
                                        <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
                                    )}
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <Text style={styles.entryDate}>
                                        {
                                            edu.startDate ? `${edu.startDate}-` : ""
                                        }
                                        {edu.endDate}
                                    </Text>
                                    {edu.location && (
                                        <Text style={styles.entryLocation}>{edu.location}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Certifications ── */}
                {vis.certifications && enabledCertifications.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Certifications" />
                        {enabledCertifications.map((cert) => (
                            <View key={cert.id} style={styles.certificationRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.certificationName}>{cert.name}</Text>
                                    <Text style={styles.certificationOrg}>{cert.organization}</Text>
                                </View>
                                {cert.date && (
                                    <Text style={styles.entryDate}>{cert.date}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Skills ── */}
                {vis.skills && enabledSkills.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="Skills" />
                        {enabledSkills.map((skill) => (
                            <View key={skill.id} style={styles.skillRow}>
                                <Text style={styles.skillCategory}>{skill.category}:</Text>
                                <Text style={styles.skillItems}>
                                    {skill.items.join(", ")}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
};
