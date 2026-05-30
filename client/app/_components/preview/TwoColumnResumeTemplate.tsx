"use client"

import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Link,
} from "@react-pdf/renderer";
import type { ExperienceEntry, Resume, ResumeVisibility, SectionTitles } from "../../_lib/types/resume";
import type { OrderableSection } from "../../_lib/slices/resumeSlice";
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

// ─── Layout Constants ─────────────────────────────────────────────────────────

const PAGE_PAD_TOP = 36;
const PAGE_PAD_BOTTOM = 48;
const PAGE_PAD_OUTER = 36;
const LEFT_COL_WIDTH = 150;
const DIVIDER_GUTTER = 24;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	page: {
		fontFamily: FONT.normal,
		fontSize: SIZE.body,
		color: COLORS.darkGray,
		paddingTop: PAGE_PAD_TOP,
		paddingBottom: PAGE_PAD_BOTTOM,
		paddingLeft: PAGE_PAD_OUTER + LEFT_COL_WIDTH + DIVIDER_GUTTER,
		paddingRight: PAGE_PAD_OUTER,
		lineHeight: 1.4,
	},

	// Divider — fixed so it repeats on every page
	divider: {
		position: "absolute",
		top: PAGE_PAD_TOP,
		bottom: PAGE_PAD_BOTTOM,
		left: PAGE_PAD_OUTER + LEFT_COL_WIDTH + DIVIDER_GUTTER / 2,
		width: 1,
		backgroundColor: COLORS.border,
	},

	// Left column — absolute, only renders on the first page
	leftColumn: {
		position: "absolute",
		top: PAGE_PAD_TOP,
		left: PAGE_PAD_OUTER,
		width: LEFT_COL_WIDTH,
	},
	leftName: {
		fontSize: SIZE.name,
		fontFamily: FONT.bold,
		color: COLORS.black,
		letterSpacing: 1,
		marginBottom: 18,
	},
	leftSection: {
		marginBottom: 12,
	},
	leftSectionHeader: {
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
	leftContactRow: {
		marginBottom: 2,
	},
	leftContactText: {
		fontSize: SIZE.small,
		color: COLORS.midGray,
	},
	leftContactSeparator: {
		display: "none",
	},
	leftContactLink: {
		fontSize: SIZE.small,
		color: COLORS.accent,
		textDecoration: "none",
	},
	leftSkillCategory: {
		fontSize: SIZE.small,
		fontFamily: FONT.bold,
		color: COLORS.black,
		marginTop: 3,
		marginBottom: 2,
	},
	leftSkillCategoryFirst: {
		fontSize: SIZE.small,
		fontFamily: FONT.bold,
		color: COLORS.black,
		marginBottom: 2,
	},
	leftCertName: {
		fontSize: SIZE.body,
		fontFamily: FONT.bold,
		color: COLORS.black,
	},
	leftCertMeta: {
		fontSize: SIZE.small,
		color: COLORS.midGray,
	},

	// Right column — section
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

	// Right column — entry rows (experience / project / education)
	entryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: "8px",
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

	// Bullets — shared with both columns
	bulletList: {
		marginLeft: 10,
		marginTop: 2,
	},
	bulletLinkContainer: {
		textDecoration: "none",
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

	// Left column bullets (skill items) — slightly tighter, smaller font
	leftBulletList: {
		marginLeft: 6,
		marginTop: 0,
	},
	leftBulletRow: {
		flexDirection: "row",
		marginBottom: 1,
	},
	leftBulletDot: {
		width: 8,
		fontSize: SIZE.small,
		color: COLORS.darkGray,
		flexShrink: 0,
	},
	leftBulletText: {
		flex: 1,
		fontSize: SIZE.small,
		color: COLORS.darkGray,
	},
	leftCertRow: {
		flexDirection: "row",
		marginBottom: 4,
	},

	// Education
	educationRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: "8px",
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

	// Summary
	summaryText: {
		fontSize: SIZE.body,
		color: COLORS.darkGray,
		lineHeight: 1.5,
	},
});

const contactStyles = {
	contactText: styles.leftContactText,
	contactSeparator: styles.leftContactSeparator,
	contactLink: styles.leftContactLink,
};
const sectionHeaderStyles = { sectionHeader: styles.sectionHeader };
const leftSectionHeaderStyles = { sectionHeader: styles.leftSectionHeader };
const bulletStyles = {
	bulletList: styles.bulletList,
	bulletRow: styles.bulletRow,
	bulletDot: styles.bulletDot,
	bulletText: styles.bulletText,
	bulletLinkContainer: styles.bulletLinkContainer,
};

// ─── Right column section components ──────────────────────────────────────────

interface ExperienceSectionProps {
	visibility: ResumeVisibility;
	enabledExperience: Array<ExperienceEntry>;
	interactive?: boolean;
	title: string;
	isLast?: boolean;
}

const ExperienceSection = ({ visibility: vis, enabledExperience, interactive, title, isLast }: ExperienceSectionProps) => {
	if (!vis.experience || enabledExperience.length === 0) return null;

	const entry = (exp: ExperienceEntry) => (
		<View style={styles.entryRow}>
			<View style={{ flex: 1 }}>
				<Text style={styles.entryTitle}>{exp.title}</Text>
				<Text style={styles.entryCompany}>{exp.company}</Text>
			</View>
			<View style={{ alignItems: "flex-end" }}>
				<Text style={styles.entryDate}>
                    {exp.startDate} {exp.startDate !== "" && exp.endDate !== "" ? `-` : ""} {exp.endDate}
				</Text>
				{exp.location && (
					<Text style={styles.entryLocation}>{exp.location}</Text>
				)}
			</View>
		</View>
	);

	return (
		<View style={isLast ? [styles.section, { marginBottom: 0 }] : styles.section}>
			<SectionHeader title={title} styles={sectionHeaderStyles} />
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
	title: string;
	isLast?: boolean;
}

const ProjectsSection = ({ visibility: vis, enabledProjects, interactive, title, isLast }: ProjectsSectionProps) => {
	if (!vis.projects || enabledProjects.length === 0) return null;

	const projectHeader = (proj: NonNullable<Resume["projects"]>[number]) => (
		<View style={styles.entryRow}>
			<View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
				<Text style={styles.entryTitle}>{proj.name}</Text>
				{proj.url && (
					<Link style={styles.leftContactLink} src={proj.url}>↗</Link>
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
		<View style={isLast ? [styles.section, { marginBottom: 0 }] : styles.section}>
			<SectionHeader title={title} styles={sectionHeaderStyles} />
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
	title: string;
	isLast?: boolean;
}

const EducationSection = ({ visibility: vis, enabledEducation, interactive, title, isLast }: EducationSectionProps) => {
	if (!vis.education || enabledEducation.length === 0) return null;

	const eduEntry = (edu: Resume["education"][number]) => (
		<View key={edu.id} style={styles.educationRow}>
			<View style={styles.educationLeft}>
				<Text style={styles.educationSchool}>{edu.school}</Text>
				<Text style={styles.educationDegree}>
					{edu.degree}{edu.field ? ` ${edu.field}` : ""}
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
		<View style={isLast ? [styles.section, { marginBottom: 0 }] : styles.section}>
			<SectionHeader title={title} styles={sectionHeaderStyles} />
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

// ─── Left column primitives ───────────────────────────────────────────────────

interface StringBulletListProps {
	items: string[];
}

const StringBulletList: React.FC<StringBulletListProps> = ({ items }) => (
	<View style={styles.leftBulletList}>
		{items.filter((s) => s).map((item, i) => (
			<View key={i} style={styles.leftBulletRow} wrap={false}>
				<Text style={styles.leftBulletDot}>•</Text>
				<Text style={styles.leftBulletText}>{item}</Text>
			</View>
		))}
	</View>
);

// ─── Main Document ────────────────────────────────────────────────────────────

type RightSection = "experience" | "projects" | "education";
type LeftSection  = "skills" | "certifications";

type SectionPropsByKey = {
	experience: ExperienceSectionProps;
	projects: ProjectsSectionProps;
	education: EducationSectionProps;
};

interface ResumeDocumentProps {
	resume: Resume;
	visibility: ResumeVisibility;
	leftOrder: Array<OrderableSection>;
	rightOrder: Array<OrderableSection>;
	interactive?: boolean;
	sectionTitles: SectionTitles;
}

export const TwoColumnResumeTemplate: React.FC<ResumeDocumentProps> = ({
	resume,
	visibility,
	leftOrder,
	rightOrder,
	interactive,
	sectionTitles,
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

	// Trailing marginBottom on the last visible right-column block can push
	// the layout cursor past the page boundary and spawn a blank page.
	const summaryVisible = !!(vis.summary && summary && summary.text !== "");
	const rightSections: RightSection[] = rightOrder.filter(
		(s): s is RightSection => s === "experience" || s === "projects" || s === "education"
	);
	const leftSections: LeftSection[] = leftOrder.filter(
		(s): s is LeftSection => s === "skills" || s === "certifications"
	);
	const sectionVisible: Record<RightSection, boolean> = {
		experience: vis.experience && enabledExperience.length > 0,
		projects:   vis.projects   && enabledProjects.length   > 0,
		education:  vis.education  && enabledEducation.length  > 0,
	};
	const visibleSectionsInOrder = rightSections.filter((s) => sectionVisible[s]);
	const lastSectionKey = visibleSectionsInOrder.at(-1);
	const summaryIsLast = summaryVisible && !lastSectionKey;

	const sectionProps: SectionPropsByKey = {
		experience: { visibility: vis, enabledExperience, title: sectionTitles.experience },
		projects: { visibility: vis, enabledProjects, title: sectionTitles.projects },
		education: { visibility: vis, enabledEducation, title: sectionTitles.education },
	};

	const skillsBlock = vis.skills && enabledSkills.length > 0 ? (
		<View key="left-skills" style={styles.leftSection}>
			<SectionHeader title={sectionTitles.skills} styles={leftSectionHeaderStyles} />
			{enabledSkills.map((skill, idx) => {
				const block = (
					<>
						<Text style={idx === 0 ? styles.leftSkillCategoryFirst : styles.leftSkillCategory}>
							{skill.category}
						</Text>
						<StringBulletList items={skill.items} />
					</>
				);
				return interactive ? (
					<Link key={skill.id} src={`http://r/#${skill.id}`} style={styles.bulletLinkContainer}>
						{block}
					</Link>
				) : (
					<View key={skill.id}>{block}</View>
				);
			})}
		</View>
	) : null;

	const certificationsBlock = vis.certifications && enabledCertifications.length > 0 ? (
		<View key="left-certifications" style={styles.leftSection}>
			<SectionHeader title={sectionTitles.certifications} styles={leftSectionHeaderStyles} />
			{enabledCertifications.map((cert) => {
				const block = (
					<View style={styles.leftCertRow} wrap={false}>
						<Text style={styles.leftBulletDot}>•</Text>
						<View style={{ flex: 1 }}>
							<Text style={styles.leftCertName}>{cert.name}</Text>
							{(cert.organization || cert.date) && (
								<Text style={styles.leftCertMeta}>
									{cert.organization}{cert.organization && cert.date ? " · " : ""}{cert.date}
								</Text>
							)}
						</View>
					</View>
				);
				return interactive ? (
					<Link key={cert.id} src={`http://r/#${cert.id}`} style={styles.bulletLinkContainer}>
						{block}
					</Link>
				) : (
					<View key={cert.id}>{block}</View>
				);
			})}
		</View>
	) : null;

	const leftSectionBlocks: Record<LeftSection, React.ReactNode> = {
		skills: skillsBlock,
		certifications: certificationsBlock,
	};

	const leftColumn = (
		<View style={styles.leftColumn}>
			{interactive ? (
				<Link src={`http://r/#${header.id}`} style={styles.bulletLinkContainer}>
					<Text style={styles.leftName}>{header.name || "Your Name"}</Text>
				</Link>
			) : (
				<Text style={styles.leftName}>{header.name || "Your Name"}</Text>
			)}

			{contactItems.length > 0 && (
				<View style={styles.leftSection}>
					<SectionHeader title="Contact" styles={leftSectionHeaderStyles} />
					{contactItems
						.filter((item) => item.value !== "")
						.map((item, i) => (
							<View key={i} style={styles.leftContactRow}>
								<ContactItem
									value={item.value}
									isLink={item.isLink}
									isFirst={true}
									styles={contactStyles}
								/>
							</View>
						))}
				</View>
			)}

			{leftSections.map((section) => leftSectionBlocks[section])}
		</View>
	);

	return (
		<Document>
			<Page size="LETTER" style={styles.page}>

				{/* ── Vertical divider (repeats on every page) ── */}
				<View fixed style={styles.divider} />

				{/* ── Left sidebar (page 1 only) ── */}
				{leftColumn}

				{/* ── Right column: Summary ── */}
				{vis.summary && summary && summary.text !== "" && (
					<View style={summaryIsLast ? [styles.section, { marginBottom: 0 }] : styles.section}>
						<SectionHeader title={sectionTitles.summary} styles={sectionHeaderStyles} />
						{interactive ? (
							<Link src={`http://r/#${summary.id}`} style={styles.bulletLinkContainer}>
								<Text style={styles.summaryText}>{summary.text}</Text>
							</Link>
						) : (
							<Text style={styles.summaryText}>{summary.text}</Text>
						)}
					</View>
				)}

				{/* ── Right column: ordered sections (skills & certifications skipped — left column) ── */}
				{rightSections.map((section) => {
					const isLast = section === lastSectionKey;
					switch (section) {
						case "experience":
							return <ExperienceSection interactive={interactive} isLast={isLast} key="resume-experience" {...sectionProps.experience} />;
						case "projects":
							return <ProjectsSection interactive={interactive} isLast={isLast} key="resume-projects" {...sectionProps.projects} />;
						case "education":
							return <EducationSection interactive={interactive} isLast={isLast} key="resume-education" {...sectionProps.education} />;
					}
				})}

			</Page>
		</Document>
	);
};
