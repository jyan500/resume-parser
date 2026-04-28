import type { ResumeSuggestion, SuggestedBullet, Keyword } from "../../types/resume"
import { v4 as uuidv4 } from "uuid"

export interface ServerTailorResumeSchema {
    missingKeywords: Array<Keyword>
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
        suggestedBullets: data.suggestedBullets,
        numSuggestions: data.suggestedBullets.length,
    } as ResumeSuggestion
}
