import type { ResumeSuggestion, SuggestedBullet, Keyword, Resume } from "../../types/resume"
import { v4 as uuidv4 } from "uuid"

export interface ServerTailorResumeSchema {
    missing_keywords: Array<Keyword>
    recommendations: Array<string>
    suggested_bullets: Array<SuggestedBullet>
}

export const mapServerTailorResumeToClient = (data: ServerTailorResumeSchema) => {
    return {
        missingKeywords: data.missing_keywords.map((keyword) => {
            return {
                ...keyword,
                id: uuidv4()
            }
        }),
        recommendations: data.recommendations,
        suggestedBullets: data.suggested_bullets,
    } as ResumeSuggestion
}
