import type { Resume, ExperienceEntry, EducationEntry, SkillCategory, ProjectEntry, Bullet, CertificationEntry } from "./resume";
import { v4 as uuid } from "uuid";

// ─── Server-side Schema Mirrors (from server/utils/schema.py) ───────────────────

export type WorkType = "Onsite" | "Hybrid" | "Remote" | "";

export interface ServerSkill {
    category: string;
    skills: string[];
}

export interface ServerEducation {
    school_name: string;
    major: string;
    degree: string;
    graduation_date: string;
}

export interface ServerCertification {
    name: string;
    organization: string;
    date: string;
}

export interface ServerExperience {
    company: string;
    location: string;
    work_type: WorkType;
    job_title: string;
    start_date: string;
    end_date: string;
    bullets: string[];
}

export interface ServerProject {
    title: string;
    bullets: string[];
}

export interface ServerResumeSchema {
    first_name: string;
    last_name: string;
    location: string;
    phone_number: string;
    summary: string;
    email: string;
    urls: string[];
    education: ServerEducation[];
    certifications: ServerCertification[];
    experience: ServerExperience[];
    skills: ServerSkill[];
    projects: ServerProject[];
    languages: string[];
    interests: string[];
}

// ─── Mapping: Server → Client Resume ─────────────────────────────────────────────

function mapBulletsToClientBullets(bullets: string[]): Bullet[] {
    return bullets.map((text) => ({
        id: uuid(),
        text,
        enabled: true,
    }));
}

export function mapServerResumeToClient(server: ServerResumeSchema): Resume {
    // Header / contact
    const fullName = [server.first_name, server.last_name].filter(Boolean).join(" ").trim();
    // Experience
    const experience: ExperienceEntry[] = (server.experience ?? []).map((exp) => {
        // Naive split for date range like "Jan 2020 - Present"
        return {
            id: uuid(),
            company: exp.company ?? "",
            title: exp.job_title ?? "",
            urls: server.urls,
            location: exp.location ?? "",
            startDate: exp.start_date ?? "",
            endDate: exp.end_date ?? "",
            bullets: mapBulletsToClientBullets(exp.bullets ?? []),
            enabled: true,
        };
    });

    // Education
    const education: EducationEntry[] = (server.education ?? []).map((edu) => ({
        id: uuid(),
        school: edu.school_name ?? "",
        degree: edu.degree ?? "",
        field: edu.major ?? "",
        location: "",
        startDate: "",
        endDate: edu.graduation_date ?? "",
        gpa: "",
        enabled: true,
    }));

    // Certifications
    const certifications: CertificationEntry[] = (server.certifications ?? []).map(
        (cert) => ({
            id: uuid(),
            name: cert.name ?? "",
            organization: cert.organization ?? "",
            date: cert.date ?? "",
            enabled: true,
        })
    );

    // Skills – group by category
    const skills: SkillCategory[] =
        server.skills && server.skills.length
            ? server.skills.map((skill) => (
                  {
                      id: uuid(),
                      category: skill.category !== "" ? skill.category : "Skills",
                      items: skill.skills,
                      enabled: true,
                  }
            )) : [];

    // Projects
    const projects: ProjectEntry[] =
        server.projects?.map((proj) => ({
            id: uuid(),
            name: proj.title ?? "",
            description: "",
            url: "",
            technologies: [],
            bullets: mapBulletsToClientBullets(proj.bullets ?? []),
            enabled: true,
        })) ?? [];

    const resume: Resume = {
        header: {
            name: fullName,
            email: server.email ?? "",
            phone: server.phone_number ?? "",
            location: server.location ?? "",
            urls: server.urls ?? [],
        },
        summary: server.summary ?? "",
        experience,
        education,
        certifications,
        skills,
        projects,
        languages: server.languages ?? [],
        interests: server.interests ?? [],
    };

    return resume;
}

