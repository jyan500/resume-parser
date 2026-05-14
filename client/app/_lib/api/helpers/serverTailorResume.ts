import type { SuggestedBullet } from "../../types/resume"

export interface ServerTailorResumeSchema {
	suggestedBullets: Array<SuggestedBullet>
}

export const mapServerTailorResumeToClient = (data: ServerTailorResumeSchema) => {
	return {
		suggestedBullets: data.suggestedBullets,
		numSuggestions: data.suggestedBullets.length,
	}
}
