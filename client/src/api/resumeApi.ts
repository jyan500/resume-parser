import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Resume } from "../types/resume";

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface ParseResumeResponse {
    resume: Resume;
}

export interface AnalyzeRequest {
    resume_text: string;
    job_description: string;
}

export interface AnalyzeResponse {
    missing_keywords: string[];
    recommendations: string[];
}

export interface HealthResponse {
    status: string;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const resumeApi = createApi({
    reducerPath: "resumeApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    endpoints: (builder) => ({

        // POST /parse-resume — multipart/form-data with a "resume" file field
        parseResume: builder.mutation<ParseResumeResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append("resume", file);
                return {
                    url: "/parse-resume",
                    method: "POST",
                    body: formData,
                    // Do NOT set Content-Type manually — fetch sets it automatically
                    // with the correct multipart boundary when body is FormData.
                };
            },
        }),

        // POST /analyze — JSON body with resume_text + job_description
        analyzeResume: builder.mutation<AnalyzeResponse, AnalyzeRequest>({
            query: (body) => ({
                url: "/analyze",
                method: "POST",
                body,
                headers: {
                    "Content-Type": "application/json",
                },
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
    useAnalyzeResumeMutation,
    useHealthCheckQuery,
} = resumeApi;