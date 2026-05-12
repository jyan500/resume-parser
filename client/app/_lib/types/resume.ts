// ─── Primitives ───────────────────────────────────────────────────────────────
export interface ResumeHeader {
	id: string
	name: string;
	email: string;
	phone: string;
	location: string;
	urls: Array<string>;
}

export interface Bullet {
	id: string;
	text: string;
	enabled: boolean;
}

export interface ExperienceEntry {
	id: string;
	company: string;
	title: string;
	location?: string;
	startDate: string;
	endDate: string; // "Present" or date string
	bullets: Bullet[];
	enabled: boolean;
}

export interface EducationEntry {
	id: string;
	school: string;
	degree: string;
	field?: string;
	location?: string;
	startDate: string;
	endDate: string;
	gpa?: string;
	enabled: boolean;
}

export interface SkillCategory {
	id: string;
	category: string;
	items: string[];
	enabled: boolean;
}

export interface ProjectEntry {
	id: string;
	name: string;
	description: string;
	url?: string;
	technologies?: string[];
	bullets: Bullet[];
	enabled: boolean;
}

export interface CertificationEntry {
	id: string;
	name: string;
	organization: string;
	date: string;
	enabled: boolean;
}

export interface SummaryEntry {
	id: string
	text: string
}

// ─── Section Titles ───────────────────────────────────────────────────────────
export interface SectionTitles {
	summary: string;
	experience: string;
	education: string;
	certifications: string;
	skills: string;
	projects: string;
}

// ─── Root Resume ──────────────────────────────────────────────────────────────
export interface Resume {
	header: ResumeHeader;
	summary?: SummaryEntry;
	experience: ExperienceEntry[];
	education: EducationEntry[];
	certifications: CertificationEntry[];
	skills: SkillCategory[];
	projects?: ProjectEntry[];
	languages: string[];
	interests: string[];
}

// ─── Visibility Toggles ───────────────────────────────────────────────────────
export interface ResumeVisibility {
	summary: boolean;
	experience: boolean;
	education: boolean;
	skills: boolean;
	certifications: boolean;
	projects: boolean;
	header: {
		phone: boolean;
		location: boolean;
		urls: boolean;
	};
}

export interface ToggleVisibility {
	summary: boolean;
	experience: boolean;
	education: boolean;
	skills: boolean;
	certifications: boolean;
	projects: boolean;
	header: boolean;
}

export interface SubToggleVisibility {
	[regionId: string]: boolean
}

export type SuggestedBullet = {
	id: string
	text: string
	newText: string
}

export type Skill = "Technical" | "Soft Skill"

export interface Keyword {
	id: string
	type: Skill
	text: string
	inSkillsOnly: boolean
}

export interface ResumeSuggestion {
	missingKeywords: Array<Keyword>
	suggestedBullets: Array<SuggestedBullet>
	numSuggestions: number
}

export type ResumeTemplate = "modern" | "classic"

// ─── UI / Editor State ────────────────────────────────────────────────────────
export type ActiveSection =
	| "header"
	| "summary"
	| "experience"
	| "education"
	| "skills"
	| "projects"
	| null;

export type ParseStatus = "idle" | "parsing" | "success" | "error";

export type MobilePane = "editor" | "preview" | "targetJob";
