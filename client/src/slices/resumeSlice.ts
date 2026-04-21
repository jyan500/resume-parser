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
    ToggleVisibility,
    SkillCategory,
    ProjectEntry,
    Bullet,
    ResumeTemplate,
    SubToggleVisibility,
    ResumeSuggestion,
    SummaryEntry,
    SectionTitles,
} from "../types/resume";

// ─── Default State ────────────────────────────────────────────────────────────

export type ContainsBullets = "projects" | "experience"
export type OrderableSection = "experience" | "projects" | "education" | "certifications" | "skills";
type TargetJobViewMode = "form" | "suggestions"
export const ORDERS = {
    "modern": ["experience", "projects", "education", "certifications", "skills"] as Array<OrderableSection>,
    "classic": ["education", "certifications", "experience", "projects", "skills"] as Array<OrderableSection>,
}

export type RegionToSection = {
    [key: string]: keyof ToggleVisibility
}

export type SubRegionToRegion = {
    [key: string]: string
}

const DEFAULT_RESUME: Resume = {
    header: {
        id: "",
        name: "",
        email: "",
        phone: "",
        location: "",
        urls: [],
    },
    summary: {id: "", text: ""},
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

const TOGGLE_VISIBILITY: ToggleVisibility = {
    summary: false,
    experience: false,
    education: false,
    certifications: false,
    skills: false,
    projects: false,
    header: true
};

const DEFAULT_SUGGESTIONS: ResumeSuggestion = {
    suggestedBullets: [],
    missingKeywords: [],
    recommendations: [],
    numSuggestions: 0,
}

export const DEFAULT_SECTION_TITLES: SectionTitles = {
    summary: "Professional Summary",
    experience: "Professional Experience",
    education: "Education",
    certifications: "Certifications",
    skills: "Skills",
    projects: "Projects",
}

// ─── Slice State Type ─────────────────────────────────────────────────────────

export interface ResumeState {
    resume: Resume;
    visibility: ResumeVisibility;
    toggleVisibility: ToggleVisibility;
    sectionTitles: SectionTitles;
    regionToSection: RegionToSection;
    subRegionToRegion: SubRegionToRegion;
    subToggleVisibility: SubToggleVisibility;
    template: ResumeTemplate;
    suggestions: ResumeSuggestion;
    order: Array<OrderableSection>;
    activeSection: ActiveSection;
    parseStatus: ParseStatus;
    parseError: string | null;
    isDirty: boolean;
    focusedRegionId: string | null;
    hoveredBulletId: string | null;
    targetJobViewMode: TargetJobViewMode
    isDarkMode: boolean
}

const defaultState: ResumeState = {
    resume: DEFAULT_RESUME,
    suggestions: DEFAULT_SUGGESTIONS,
    visibility: DEFAULT_VISIBILITY,
    toggleVisibility: TOGGLE_VISIBILITY,
    sectionTitles: DEFAULT_SECTION_TITLES,
    subRegionToRegion: {},
    subToggleVisibility: {},
    regionToSection: {},
    template: "classic",
    order: ORDERS["classic"],
    activeSection: null,
    parseStatus: "idle",
    parseError: null,
    isDirty: false,
    focusedRegionId: null,
    hoveredBulletId: null,
    targetJobViewMode: "form",
    isDarkMode: false
}

const initialState: ResumeState = {
   ...defaultState 
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const resumeSlice = createSlice({
    name: "resume",
    initialState,
    reducers: {
        // ── Bulk ────────────────────────────────────────────────────────────────
        setResume(state, action: PayloadAction<Resume>) {
            state.resume = action.payload;
            state.sectionTitles = DEFAULT_SECTION_TITLES;
            /* 
                map each resume region id to it's corresponding section for the purposes 
                of allowing the click on the live preview to scroll to the right section
                on the editor.
                
                For experience, projects, education and certifications, they need their own subToggleVisibility object
                because the nested content has its own 
                toggle. So we need to map the bullets to the individual experience sections
                and determine their visibility.

                For the other sections,
                regionToSection is enough because the individual sections (i.e skills, education) which can be clicked
                on the live PDF preview,
                do not have their own individual toggles, so mapping to the parent section is enough here.
            */
            const regionToSection = {} as RegionToSection
            // header
            regionToSection[state.resume.header.id] = "header"
            // summary
            if (state.resume.summary){
                regionToSection[state.resume.summary.id] = "summary"
            }
            // education
            state.resume.education.forEach((edu) => {
                regionToSection[edu.id] = "education"
                state.subToggleVisibility[edu.id] = true 
            })
            // certifications
            state.resume.certifications.forEach((cert) => {
                regionToSection[cert.id] = "certifications"
                state.subToggleVisibility[cert.id] = true 
            })
            //  experience
            state.resume.experience.forEach((experience) => {
                regionToSection[experience.id] = "experience"
                state.subToggleVisibility[experience.id] = true 
                // map each sub bullet to its parent container
                experience.bullets.forEach((bullet) => {
                    state.subRegionToRegion[bullet.id] = experience.id 
                })
            })

            // projects
            state.resume.projects?.forEach((project) => {
                regionToSection[project.id] = "projects"
                state.subToggleVisibility[project.id] = true
                // map each sub bullet to its parent container
                project.bullets.forEach((bullet) => {
                    state.subRegionToRegion[bullet.id] = project.id
                })
            })

            // skills
            state.resume.skills.forEach((skillRow) => {
                regionToSection[skillRow.id] = "skills"
            })
            state.regionToSection = regionToSection
            state.isDirty = false;
        },

        resetResume(state) {
            const { visibility, toggleVisibility, ...resettedState } = defaultState;
            // make sure to return here to reset the state
            return {
                ...resettedState,
                visibility: state.visibility,
                toggleVisibility: state.toggleVisibility,
            }
        },

        setTargetJobViewMode(state, action: PayloadAction<TargetJobViewMode>){
            state.targetJobViewMode = action.payload
        },

        setTemplate(state, action: PayloadAction<{template: ResumeTemplate, resetOrder: boolean}>){
            const {template, resetOrder} = action.payload
            state.template = template
            if (resetOrder){
                state.order = ORDERS[template as ResumeTemplate]
            }
        },

        setSuggestions(state, action: PayloadAction<ResumeSuggestion>){
            state.suggestions = action.payload
        },

        // Removes a single SuggestedBullet by bullet id once it has been
        // applied or dismissed by the user. Used by both BulletWithSuggestion
        // (Approach B) and TargetJobPanel (Approach A).
        dismissSuggestion(state, action: PayloadAction<string>) {
            state.suggestions.suggestedBullets = state.suggestions.suggestedBullets.filter(
                (sb) => sb.id !== action.payload
            );
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
        setSummary(state, action: PayloadAction<SummaryEntry>) {
            state.resume.summary = action.payload;
            state.isDirty = true;
        },

        // ── Experience ──────────────────────────────────────────────────────────
        addExperience(state) {
            const id = uuid()
            state.resume.experience.push({
                id: id,
                company: "",
                title: "",
                location: "",
                startDate: "",
                endDate: "Present",
                bullets: [],
                enabled: true,
            });
            state.regionToSection[id] = "experience"
            state.subToggleVisibility[id] = true
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
            delete state.regionToSection[action.payload]
            delete state.subToggleVisibility[action.payload]
        },

        reorderExperience(
            state,
            action: PayloadAction<{ fromIndex: number; toIndex: number }>
        ) {
            const { fromIndex, toIndex } = action.payload;
            const temp = [...state.resume.experience]
            const from = temp[fromIndex];
            temp.splice(fromIndex, 1)
            temp.splice(toIndex, 0, from);
            state.resume.experience = temp
            state.isDirty = true;
        },

        toggleExperience(state, action: PayloadAction<string>) {
            const entry = state.resume.experience.find((e) => e.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Experience & Projects Bullets ────────────────────────────────────────
        addBullet(state, action: PayloadAction<{ section: ContainsBullets, entryId: string }>) {
            if (action.payload.section in state.resume){
                const entry = state.resume[action.payload.section]
                if (entry && Array.isArray(entry)){
                    const entity = entry.find(
                        (e) => e.id === action.payload.entryId
                    );
                    if (entity) {
                        const newId = uuid()
                        entity.bullets.push({ id: newId, text: "", enabled: true });
                        state.subRegionToRegion[newId] = entity.id
                    }
                }
                state.isDirty = true;
            }
        },

        updateBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets; entryId: string; bulletId: string; text: string }>
        ) {
            const { section, entryId, bulletId, text } = action.payload;
            const entries = state.resume[section];
            if (entries && Array.isArray(entries)) {
                const entry = entries.find((e) => e.id === entryId);
                if (entry) {
                    const bullet = entry.bullets.find((b: Bullet) => b.id === bulletId);
                    if (bullet) bullet.text = text;
                }
            }
            state.isDirty = true;
        },

        removeBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets; entryId: string; bulletId: string }>
        ) {
            const { section, entryId, bulletId } = action.payload;
            const entries = state.resume[section];
            if (entries && Array.isArray(entries)) {
                const entry = entries.find((e) => e.id === entryId);
                if (entry) {
                    entry.bullets = entry.bullets.filter((b: Bullet) => b.id !== bulletId);
                    delete state.subRegionToRegion[bulletId]
                }
            }
            state.isDirty = true;
        },

        toggleBullet(
            state,
            action: PayloadAction<{ section: ContainsBullets; entryId: string; bulletId: string }>
        ) {
            const { section, entryId, bulletId } = action.payload;
            const entries = state.resume[section];
            if (entries && Array.isArray(entries)) {
                const entry = entries.find((e) => e.id === entryId);
                if (entry) {
                    const bullet = entry.bullets.find((b: Bullet) => b.id === bulletId);
                    if (bullet) bullet.enabled = !bullet.enabled;
                }
            }
            state.isDirty = true;
        },

        reorderBullets(
            state,
            action: PayloadAction<{ section: ContainsBullets; entryId: string; fromIndex: number; toIndex: number }>
        ) {
            const { section, entryId, fromIndex, toIndex } = action.payload;
            const entries = state.resume[section];
            if (entries && Array.isArray(entries)) {
                const entry = entries.find((e) => e.id === entryId);
                if (entry) {
                    const temp = [...entry.bullets];
                    const [moved] = temp.splice(fromIndex, 1);
                    temp.splice(toIndex, 0, moved);
                    entry.bullets = temp;
                }
            }
            state.isDirty = true;
        },

        // ── Education ───────────────────────────────────────────────────────────
        addEducation(state) {
            const id = uuid()
            state.resume.education.push({
                id: id,
                school: "",
                degree: "",
                field: "",
                location: "",
                startDate: "",
                endDate: "",
                gpa: "",
                enabled: true,
            });
            state.regionToSection[id] = "education"
            state.subToggleVisibility[id] = true
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
            // also remove from the sub toggle visibility
            delete state.regionToSection[action.payload]
            delete state.subToggleVisibility[action.payload]
            state.isDirty = true;
        },

        toggleEducation(state, action: PayloadAction<string>) {
            const entry = state.resume.education.find((e) => e.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Certifications ──────────────────────────────────────────────────────
        addCertification(state) {
            const id = uuid()
            state.resume.certifications.push({
                id: id,
                name: "",
                organization: "",
                date: "",
                enabled: true,
            });
            state.regionToSection[id] = "certifications"
            state.subToggleVisibility[id] = true
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
            delete state.regionToSection[action.payload]
            delete state.subToggleVisibility[action.payload]
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
            delete state.regionToSection[action.payload]
        },

        toggleSkillCategory(state, action: PayloadAction<string>) {
            const entry = state.resume.skills.find((s) => s.id === action.payload);
            if (entry) entry.enabled = !entry.enabled;
            state.isDirty = true;
        },

        // ── Projects ────────────────────────────────────────────────────────────
        addProject(state) {
            if (!state.resume.projects) state.resume.projects = [];
            const id = uuid()
            state.resume.projects.push({
                id: id,
                name: "",
                description: "",
                url: "",
                technologies: [],
                bullets: [],
                enabled: true,
            });
            state.regionToSection[id] = "projects"
            state.subToggleVisibility[id] = true
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
            delete state.regionToSection[action.payload]
            delete state.subToggleVisibility[action.payload]
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
            if (state.resume.projects?.length){
                const temp = [...state.resume.projects]
                const from = temp[fromIndex];
                temp.splice(fromIndex, 1)
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

        toggleSectionCollapseVisibility(
            state,
            action: PayloadAction<{key: keyof ToggleVisibility, isOpen: boolean}>
        ){
            const {key, isOpen} = action.payload
            state.toggleVisibility[key] = isOpen
        },

        toggleAllSectionCollapse(
            state,
            action: PayloadAction<boolean>
        ){
            Object.keys(state.toggleVisibility).forEach((key) => {
                state.toggleVisibility[key as keyof ToggleVisibility] = action.payload
            })
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

        // region id includes both separate experience section headers, education entries, etc
        setFocusedRegionId(state, action: PayloadAction<string | null>) {
            state.focusedRegionId = action.payload;
        },

        // specifically for setting hover states when hovering the suggestion cards
        setHoveredBulletId(state, action: PayloadAction<string | null>){
            state.hoveredBulletId = action.payload
        },

        setSubToggleVisibility(state, action: PayloadAction<{regionId: string, isOpen: boolean}>){
            const { regionId, isOpen } = action.payload
            state.subToggleVisibility[regionId] = isOpen
        },

        updateSectionTitle(state, action: PayloadAction<{ key: keyof SectionTitles; title: string }>) {
            state.sectionTitles[action.payload.key] = action.payload.title;
            state.isDirty = true;
        },

    },
});

export const {
    setResume,
    resetResume,
    updateHeader,
    updateOrder,
    setTemplate,
    setSuggestions,
    dismissSuggestion,
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
    setTargetJobViewMode,
    setParseStatus,
    setFocusedRegionId,
    setHoveredBulletId,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
    toggleAllSectionCollapse,
    updateSectionTitle,
} = resumeSlice.actions;

export default resumeSlice.reducer;
