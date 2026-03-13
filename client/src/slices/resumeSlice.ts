import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import type {
    Resume,
    ResumeVisibility,
    ActiveSection,
    ParseStatus,
    ExperienceEntry,
    EducationEntry,
    SkillCategory,
    ProjectEntry,
    ExperienceBullet,
} from "../types/resume";

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_RESUME: Resume = {
    header: {
        name: "",
        email: "",
        phone: "",
        location: "",
        urls: [],
    },
    summary: "",
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    projects: [],
    languages: [],
    interests: [],
};

const DEFAULT_VISIBILITY: ResumeVisibility = {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    header: {
        phone: true,
        location: true,
        urls: true,
    },
};

// ─── Slice State Type ─────────────────────────────────────────────────────────

export interface ResumeState {
    resume: Resume;
    visibility: ResumeVisibility;
    activeSection: ActiveSection;
    parseStatus: ParseStatus;
    parseError: string | null;
    isDirty: boolean;
}

const initialState: ResumeState = {
    resume: DEFAULT_RESUME,
    visibility: DEFAULT_VISIBILITY,
    activeSection: null,
    parseStatus: "idle",
    parseError: null,
    isDirty: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const resumeSlice = createSlice({
    name: "resume",
    initialState,
    reducers: {
        // ── Bulk ────────────────────────────────────────────────────────────────
        setResume(state, action: PayloadAction<Resume>) {
            state.resume = action.payload;
            state.isDirty = false;
        },

        resetResume(state) {
            state.resume = DEFAULT_RESUME;
            state.visibility = DEFAULT_VISIBILITY;
            state.isDirty = false;
            state.parseStatus = "idle";
            state.parseError = null;
        },

        // ── Header ──────────────────────────────────────────────────────────────
        updateHeader(state, action: PayloadAction<Partial<Resume["header"]>>) {
            Object.assign(state.resume.header, action.payload);
            state.isDirty = true;
        },

        // ── Summary ─────────────────────────────────────────────────────────────
        setSummary(state, action: PayloadAction<string>) {
            state.resume.summary = action.payload;
            state.isDirty = true;
        },

        // ── Experience ──────────────────────────────────────────────────────────
        addExperience(state) {
            state.resume.experience.push({
                id: uuid(),
                company: "",
                title: "",
                location: "",
                startDate: "",
                endDate: "Present",
                bullets: [],
                enabled: true,
            });
            state.isDirty = true;
        },

        updateExperience(
            state,
            action: PayloadAction<{ id: string; patch: Partial<ExperienceEntry> }>
        ) {
            const entry = state.resume.experience.find((e) => e.id === action.payload.id);
            if (entry) Object.assign(entry, action.payload.patch);
            state.isDirty = true;
        },

        removeExperience(state, action: PayloadAction<string>) {
            state.resume.experience = state.resume.experience.filter(
                (e) => e.id !== action.payload
            );
            state.isDirty = true;
        },

        reorderExperience(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            const [moved] = state.resume.experience.splice(fromIndex, 1);
            state.resume.experience.splice(toIndex, 0, moved);
            state.isDirty = true;
        },

        toggleExperience(state, action: PayloadAction<string>) {
            const entry = state.resume.experience.find((e) => e.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Bullets ─────────────────────────────────────────────────────────────
        addBullet(state, action: PayloadAction<{ experienceId: string }>) {
            const entry = state.resume.experience.find(
                (e) => e.id === action.payload.experienceId
            );
            if (entry) {
                entry.bullets.push({ id: uuid(), text: "", enabled: true });
            }
            state.isDirty = true;
        },

        updateBullet(
            state,
            action: PayloadAction<{ experienceId: string; bulletId: string; text: string }>
        ) {
            const { experienceId, bulletId, text } = action.payload;
            const entry = state.resume.experience.find((e) => e.id === experienceId);
            const bullet = entry?.bullets.find((b: ExperienceBullet) => b.id === bulletId);
            if (bullet) bullet.text = text;
            state.isDirty = true;
        },

        removeBullet(
            state,
            action: PayloadAction<{ experienceId: string; bulletId: string }>
        ) {
            const { experienceId, bulletId } = action.payload;
            const entry = state.resume.experience.find((e) => e.id === experienceId);
            if (entry) {
                entry.bullets = entry.bullets.filter(
                    (b: ExperienceBullet) => b.id !== bulletId
                );
            }
            state.isDirty = true;
        },

        toggleBullet(
            state,
            action: PayloadAction<{ experienceId: string; bulletId: string }>
        ) {
            const { experienceId, bulletId } = action.payload;
            const entry = state.resume.experience.find((e) => e.id === experienceId);
            const bullet = entry?.bullets.find((b: ExperienceBullet) => b.id === bulletId);
            if (bullet) bullet.enabled = !bullet.enabled;
            state.isDirty = true;
        },

        reorderBullets(
            state,
            action: PayloadAction<{
                experienceId: string;
                fromIndex: number;
                toIndex: number;
            }>
        ) {
            const { experienceId, fromIndex, toIndex } = action.payload;
            const entry = state.resume.experience.find((e) => e.id === experienceId);
            if (entry) {
                const [moved] = entry.bullets.splice(fromIndex, 1);
                entry.bullets.splice(toIndex, 0, moved);
            }
            state.isDirty = true;
        },

        // ── Education ───────────────────────────────────────────────────────────
        addEducation(state) {
            state.resume.education.push({
                id: uuid(),
                school: "",
                degree: "",
                field: "",
                location: "",
                startDate: "",
                endDate: "",
                gpa: "",
                enabled: true,
            });
            state.isDirty = true;
        },

        updateEducation(
            state,
            action: PayloadAction<{ id: string; patch: Partial<EducationEntry> }>
        ) {
            const entry = state.resume.education.find((e) => e.id === action.payload.id);
            if (entry) Object.assign(entry, action.payload.patch);
            state.isDirty = true;
        },

        removeEducation(state, action: PayloadAction<string>) {
            state.resume.education = state.resume.education.filter(
                (e) => e.id !== action.payload
            );
            state.isDirty = true;
        },

        toggleEducation(state, action: PayloadAction<string>) {
            const entry = state.resume.education.find((e) => e.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Skills ──────────────────────────────────────────────────────────────
        addSkillCategory(state) {
            state.resume.skills.push({
                id: uuid(),
                category: "",
                items: [],
                enabled: true,
            });
            state.isDirty = true;
        },

        updateSkillCategory(
            state,
            action: PayloadAction<{ id: string; patch: Partial<SkillCategory> }>
        ) {
            const entry = state.resume.skills.find((s) => s.id === action.payload.id);
            if (entry) Object.assign(entry, action.payload.patch);
            state.isDirty = true;
        },

        removeSkillCategory(state, action: PayloadAction<string>) {
            state.resume.skills = state.resume.skills.filter(
                (s) => s.id !== action.payload
            );
            state.isDirty = true;
        },

        toggleSkillCategory(state, action: PayloadAction<string>) {
            const entry = state.resume.skills.find((s) => s.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Projects ────────────────────────────────────────────────────────────
        addProject(state) {
            if (!state.resume.projects) state.resume.projects = [];
            state.resume.projects.push({
                id: uuid(),
                name: "",
                description: "",
                url: "",
                technologies: [],
                bullets: [],
                enabled: true,
            });
            state.isDirty = true;
        },

        updateProject(
            state,
            action: PayloadAction<{ id: string; patch: Partial<ProjectEntry> }>
        ) {
            const entry = state.resume.projects?.find((p) => p.id === action.payload.id);
            if (entry) Object.assign(entry, action.payload.patch);
            state.isDirty = true;
        },

        removeProject(state, action: PayloadAction<string>) {
            if (state.resume.projects) {
                state.resume.projects = state.resume.projects.filter(
                    (p) => p.id !== action.payload
                );
            }
            state.isDirty = true;
        },

        toggleProject(state, action: PayloadAction<string>) {
            const entry = state.resume.projects?.find((p) => p.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Visibility ──────────────────────────────────────────────────────────
        setVisibility(state, action: PayloadAction<Partial<ResumeVisibility>>) {
            Object.assign(state.visibility, action.payload);
        },

        toggleSectionVisibility(
            state,
            action: PayloadAction<keyof Omit<ResumeVisibility, "header">>
        ) {
            state.visibility[action.payload] = !state.visibility[action.payload];
        },

        toggleHeaderField(
            state,
            action: PayloadAction<keyof ResumeVisibility["header"]>
        ) {
            state.visibility.header[action.payload] =
                !state.visibility.header[action.payload];
        },

        // ── UI ──────────────────────────────────────────────────────────────────
        setActiveSection(state, action: PayloadAction<ActiveSection>) {
            state.activeSection = action.payload;
        },

        setParseStatus(
            state,
            action: PayloadAction<{ status: ParseStatus; error?: string }>
        ) {
            state.parseStatus = action.payload.status;
            state.parseError = action.payload.error ?? null;
        },
    },
});

export const {
    setResume,
    resetResume,
    updateHeader,
    setSummary,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    toggleExperience,
    addBullet,
    updateBullet,
    removeBullet,
    toggleBullet,
    reorderBullets,
    addEducation,
    updateEducation,
    removeEducation,
    toggleEducation,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    toggleSkillCategory,
    addProject,
    updateProject,
    removeProject,
    toggleProject,
    setVisibility,
    toggleSectionVisibility,
    toggleHeaderField,
    setActiveSection,
    setParseStatus,
} = resumeSlice.actions;

export default resumeSlice.reducer;