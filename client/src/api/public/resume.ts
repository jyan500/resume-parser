import { TAILOR_RESUME_URL, PARSE_RESUME_URL } from "../../helpers/urls";
import type { Resume } from "../../types/resume";
import type { ServerResumeSchema } from "../../types/serverResume";
import { mapServerResumeToClient } from "../../types/serverResume";
import { publicApi } from "../public"

// ─── Request / Response Types ─────────────────────────────────────────────────

// Raw server response matches `ResumeSchema` in `server/utils/schema.py`
export type ParseResumeServerResponse = ServerResumeSchema;

// Client-facing response exposed by RTK Query
export interface ParseResumeResponse {
    resume: Resume;
}

export interface TailorRequest {
    resume: Resume;
    jobTitle: string;
    jobDescription: string;
}

export interface TailorResponse {
    missing_keywords: string[];
    recommendations: string[];
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

        // POST /tailor — JSON body with resume JSON + job_description
        tailorResume: builder.mutation<TailorResponse, TailorRequest>({
            query: (body) => ({
                url: TAILOR_RESUME_URL,
                method: "POST",
                body: {
                    jobDescription: body.jobDescription,
                    jobTitle: body.jobTitle,
                    resume: {
                        "projects": body.resume?.projects ?? [],
                        "experience": body.resume?.experience ?? [],
                    } 
                }
            }),
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
    useTailorResumeMutation,
    useHealthCheckQuery,
} = resumeApi;
