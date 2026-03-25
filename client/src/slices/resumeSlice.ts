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
    CertificationEntry,
    SkillCategory,
    ProjectEntry,
    Bullet,
    ResumeTemplate,
} from "../types/resume";

// ─── Default State ────────────────────────────────────────────────────────────

export type ContainsBullets = "projects" | "experience"
export type OrderableSection = "experience" | "projects" | "education" | "certifications" | "skills";
export const ORDERS = {
    "modern": ["experience", "projects", "education", "certifications", "skills"] as Array<OrderableSection>,
    "classic": ["education", "certifications", "experience", "projects", "skills"] as Array<OrderableSection>,
}

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
    certifications: true,
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
    template: ResumeTemplate;
    order: Array<OrderableSection>;
    activeSection: ActiveSection;
    parseStatus: ParseStatus;
    parseError: string | null;
    isDirty: boolean;
}

const initialState: ResumeState = {
    resume: DEFAULT_RESUME,
    visibility: DEFAULT_VISIBILITY,
    template: "classic",
    order: ORDERS["classic"],
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

        setTemplate(state, action: PayloadAction<{template: ResumeTemplate, resetOrder: boolean}>){
            const {template, resetOrder} = action.payload
            state.template = template
            if (resetOrder){
                state.order = ORDERS[template as ResumeTemplate]
            }
        },

        /*
            Reorders the section order array.
            Same splice pattern as reorderExperience / reorderProjects:
            remove the item at fromIndex, then insert it at toIndex.
        */
        updateOrder(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            const temp = [...state.order];
            const [moved] = temp.splice(fromIndex, 1);
            temp.splice(toIndex, 0, moved);
            state.order = temp;
            state.isDirty = true;
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

        /* 
            i.e if you move an item from index 0 to index 2 (and there are 3 items in the list) 

            i = 0  *A*  
            i = 1  *B*
            i = 2  *C*
            i = 3  *D*

            remove i = 0 first
            so now the other indices are shifted
            i = 0 *B*
            i = 1 *C*
            i = 2 *D*

            now A would need to be inserted between C and D,
            so after index 1. Note that before we deleted "A",
            "C" used to be index 2, so we'd insert at index 2,
            so now "D" gets pushed to index 3 after the insert
        */
        reorderExperience(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            // remove element at fromIndex
            const temp = [...state.resume.experience]
            const from = temp[fromIndex];
            temp.splice(fromIndex, 1)
            // insert element at toIndex
            temp.splice(toIndex, 0, from);
            state.resume.experience = temp
            state.isDirty = true;
        },

        toggleExperience(state, action: PayloadAction<string>) {
            const entry = state.resume.experience.find((e) => e.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Experience & Projects Bullets ─────────────────────────────────────────────────────────────
        addBullet(state, action: PayloadAction<{ section: ContainsBullets, entryId: string }>) {
            if (action.payload.section in state.resume){
                const entry = state.resume[action.payload.section]
                if (entry && Array.isArray(entry)){
                    const entity = entry.find(
                        (e) => e.id === action.payload.entryId
                    );
                    if (entity) {
                        entity.bullets.push({ id: uuid(), text: "", enabled: true });
                    }
                }
                state.isDirty = true;
            }
        },

        updateBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets, entryId: string; bulletId: string; text: string }>
        ) {
            const { section, entryId, bulletId, text } = action.payload;
            if (section in state.resume){
                const entry = state.resume[section]
                if (entry && Array.isArray(entry)){
                    const entity = entry.find((e) => e.id === entryId);
                    if (entity){
                        const bullet = entity?.bullets.find((b: Bullet) => b.id === bulletId);
                        if (bullet) bullet.text = text;
                        state.isDirty = true;
                    }
                }
            }
        },

        removeBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets, entryId: string; bulletId: string }>
        ) {
            const { section, entryId, bulletId } = action.payload;
            if (section in state.resume){
                const entry = state.resume[section]
                if (entry && Array.isArray(entry)) {
                    const entity = entry.find((e) => e.id === entryId);
                    if (entity){
                        entity.bullets = entity.bullets.filter(
                            (b: Bullet) => b.id !== bulletId
                        );
                    }
                }
                state.isDirty = true;
            }
        },

        toggleBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets, entryId: string; bulletId: string }>
        ) {
            const { section, entryId, bulletId } = action.payload;
            if (section in state.resume){
                const entry = state.resume[section]
                if (entry && Array.isArray(entry)){
                    const entity = entry.find((e) => e.id === entryId);
                    const bullet = entity?.bullets.find((b: Bullet) => b.id === bulletId);
                    if (bullet) bullet.enabled = !bullet.enabled;
                    state.isDirty = true;
                }
            }
        },

        reorderBullets(
            state,
            action: PayloadAction<{
                section: ContainsBullets
                entryId: string;
                fromIndex: number;
                toIndex: number;
            }>
        ) {
            const { section, entryId, fromIndex, toIndex } = action.payload;
            if (section in state.resume){
                const entry = state.resume[section]
                if (entry){
                    const entity = entry.find((e) => e.id === entryId);
                    if (entity) {
                        const [moved] = entity.bullets.splice(fromIndex, 1);
                        entity.bullets.splice(toIndex, 0, moved);
                    }
                    state.isDirty = true;
                }
            }
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

        // ── Certifications ──────────────────────────────────────────────────────
        addCertification(state) {
            state.resume.certifications.push({
                id: uuid(),
                name: "",
                organization: "",
                date: "",
                enabled: true,
            });
            state.isDirty = true;
        },

        updateCertification(
            state,
            action: PayloadAction<{ id: string; patch: Partial<CertificationEntry> }>
        ) {
            const entry = state.resume.certifications.find((c) => c.id === action.payload.id);
            if (entry) Object.assign(entry, action.payload.patch);
            state.isDirty = true;
        },

        removeCertification(state, action: PayloadAction<string>) {
            state.resume.certifications = state.resume.certifications.filter(
                (c) => c.id !== action.payload
            );
            state.isDirty = true;
        },

        toggleCertification(state, action: PayloadAction<string>) {
            const entry = state.resume.certifications.find((c) => c.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        reorderCertifications(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            const temp = [...state.resume.certifications];
            const from = temp[fromIndex];
            temp.splice(fromIndex, 1);
            temp.splice(toIndex, 0, from);
            state.resume.certifications = temp;
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

        reorderProjects(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            // remove element at fromIndex
            if (state.resume.projects?.length){
                const temp = [...state.resume.projects]
                const from = temp[fromIndex];
                temp.splice(fromIndex, 1)
                // insert element at toIndex
                temp.splice(toIndex, 0, from);
                state.resume.projects = temp
                state.isDirty = true;
            }
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
    updateOrder,
    setTemplate,
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
    addCertification,
    updateCertification,
    removeCertification,
    toggleCertification,
    reorderCertifications,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    toggleSkillCategory,
    addProject,
    updateProject,
    removeProject,
    toggleProject,
    reorderProjects,
    setVisibility,
    toggleSectionVisibility,
    toggleHeaderField,
    setActiveSection,
    setParseStatus,
} = resumeSlice.actions;

export default resumeSlice.reducer;
