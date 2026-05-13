import { PARSE_RESUME_URL } from "../urls";
import type { Resume } from "../types/resume";
import { type ServerResumeSchema, mapServerResumeToClient } from "./helpers/serverResume";
import { publicApi } from "./public";

// ─── Request / Response Types ─────────────────────────────────────────────────

// Raw server response matches `ResumeSchema` in `server/utils/schema.py`
export type ParseResumeServerResponse = ServerResumeSchema;

// Client-facing response exposed by RTK Query
export interface ParseResumeResponse {
	resume: Resume;
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

	}),
});

// ─── Auto-generated hooks ─────────────────────────────────────────────────────

export const {
	useParseResumeMutation,
} = resumeApi;
