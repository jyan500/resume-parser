import type { ResumeSuggestion, SuggestedBullet, Keyword, Resume } from "../../types/resume"
import { v4 as uuidv4 } from "uuid"

export interface ServerTailorResumeSchema {
    missingKeywords: Array<Keyword>
    recommendations: Array<string>
    suggestedBullets: Array<SuggestedBullet>
    numSuggestions: number
}

export const mapServerTailorResumeToClient = (data: ServerTailorResumeSchema) => {
    return {
        missingKeywords: data.missingKeywords.map((keyword) => {
            return {
                ...keyword,
                id: uuidv4()
            }
        }),
        recommendations: data.recommendations,
        suggestedBullets: data.suggestedBullets,
        numSuggestions: data.suggestedBullets.length,
    } as ResumeSuggestion
}
