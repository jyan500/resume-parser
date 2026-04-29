import type { Keyword, Skill } from "../../types/resume"
import { v4 as uuidv4 } from "uuid"

export interface ServerMissingKeyword {
    type: Skill
    text: string
    inSkillsOnly: boolean
}

export interface ServerMissingKeywordsSchema {
    keywords: Array<ServerMissingKeyword>
}

export const mapServerMissingKeywordsToClient = (
    data: ServerMissingKeywordsSchema
): Array<Keyword> => {
    return data.keywords.map((k) => ({ ...k, id: uuidv4() }))
}
