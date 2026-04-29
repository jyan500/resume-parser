import { TAILOR_RESUME_URL, MISSING_KEYWORDS_URL, PARSE_RESUME_URL } from "../../helpers/urls";
import type { Keyword, Resume, ResumeSuggestion } from "../../types/resume";
import { type ServerResumeSchema, mapServerResumeToClient } from "../helpers/serverResume";
import { type ServerTailorResumeSchema, mapServerTailorResumeToClient } from "../helpers/serverTailorResume";
import { type ServerMissingKeywordsSchema, mapServerMissingKeywordsToClient } from "../helpers/serverMissingKeywords";
import { publicApi } from "../public"

// ─── Request / Response Types ─────────────────────────────────────────────────

// Raw server response matches `ResumeSchema` in `server/utils/schema.py`
export type ParseResumeServerResponse = ServerResumeSchema;
export type TailorResumeServerResponse = ServerTailorResumeSchema

// Client-facing response exposed by RTK Query
export interface ParseResumeResponse {
    resume: Resume;
}

export interface MissingKeywordsRequest {
    resume: Resume;
    jobTitle: string;
    jobDescription: string;
}

export interface TailorRequest {
    resume: Resume;
    jobTitle: string;
    jobDescription: string;
    missingKeywords: Array<Pick<Keyword, "text" | "type">>;
}

export interface HealthResponse {
    status: string;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const resumeApi = publicApi.injectEndpoints({
    endpoints: (builder) => ({

        // POST /parse-resume — multipart/form-data with a "resume" file field
        parseResume: builder.mutation<ParseResumeResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append("resume", file);
                return {
                    url: PARSE_RESUME_URL,
                    method: "POST",
                    body: formData,
                    // Do NOT set Content-Type manually — fetch sets it automatically
                    // with the correct multipart boundary when body is FormData.
                };
            },
            transformResponse: (raw: ParseResumeServerResponse) => ({
                resume: mapServerResumeToClient(raw),
            }),
        }),

        // POST /missing-keywords — extracts JD keywords and computes which are missing
        getMissingKeywords: builder.mutation<Array<Keyword>, MissingKeywordsRequest>({
            query: (body) => ({
                url: MISSING_KEYWORDS_URL,
                method: "POST",
                body: {
                    jobDescription: body.jobDescription,
                    jobTitle: body.jobTitle,
                    resume: {
                        experience: body.resume?.experience ?? [],
                        projects: body.resume?.projects ?? [],
                        skills: body.resume?.skills ?? [],
                    },
                },
            }),
            transformResponse: (raw: ServerMissingKeywordsSchema) =>
                mapServerMissingKeywordsToClient(raw),
        }),

        // POST /tailor — JSON body with resume JSON + job_description + missing keywords
        tailorResume: builder.mutation<Pick<ResumeSuggestion, "suggestedBullets" | "numSuggestions">, TailorRequest>({
            query: (body) => ({
                url: TAILOR_RESUME_URL,
                method: "POST",
                body: {
                    jobDescription: body.jobDescription,
                    jobTitle: body.jobTitle,
                    resume: {
                        "projects": body.resume?.projects ?? [],
                        "experience": body.resume?.experience ?? [],
                    },
                    missingKeywords: body.missingKeywords,
                    // TODO: add the "strictness" configuration in the future
                    // this is defaulted to the "add plausible keywords" configuration
                    promptVersion: "variants"
                }
            }),
            transformResponse: (raw: TailorResumeServerResponse) =>
                mapServerTailorResumeToClient(raw)
        }),

        // GET /health — useful to ping the backend on mount
        healthCheck: builder.query<HealthResponse, void>({
            query: () => "/health",
        }),

    }),
});

// ─── Auto-generated hooks ─────────────────────────────────────────────────────

export const {
    useParseResumeMutation,
    useGetMissingKeywordsMutation,
    useTailorResumeMutation,
    useHealthCheckQuery,
} = resumeApi;
