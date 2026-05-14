import { describe, it, expect } from 'vitest'
import reducer, {
    initialState,
    setResume,
    addExperience,
    removeExperience,
    reorderExperience,
    addBullet,
    removeBullet,
    reorderBullets,
    updateOrder,
    dismissSuggestion,
    dismissAllSuggestions,
    toggleExperience,
    toggleSectionVisibility,
    updateHeader,
    type ResumeState,
} from './resumeSlice'
import type { Resume } from '../types/resume'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// structuredClone ensures each test gets a fully independent deep copy —
// without it, tests that mutate nested objects would share references and interfere with each other.
function freshState(): ResumeState {
    return structuredClone(initialState)
}

const RESUME: Resume = {
    header: { id: 'h1', name: 'Jane', email: 'j@e.com', phone: '555', location: 'NY', urls: [] },
    summary: { id: 's1', text: 'A summary' },
    experience: [
        {
            id: 'exp1', company: 'ACME', title: 'Eng', startDate: '2020', endDate: 'Present',
            bullets: [{ id: 'b1', text: 'Did stuff', enabled: true }], enabled: true,
        },
        {
            id: 'exp2', company: 'Beta', title: 'Dev', startDate: '2018', endDate: '2020',
            bullets: [], enabled: true,
        },
    ],
    education: [{ id: 'edu1', school: 'MIT', degree: 'BS', field: 'CS', startDate: '2014', endDate: '2018', gpa: '4.0', enabled: true }],
    certifications: [{ id: 'cert1', name: 'AWS', organization: 'Amazon', date: '2022', enabled: true }],
    skills: [{ id: 'skill1', category: 'Languages', items: ['TypeScript'], enabled: true }],
    projects: [
        {
            id: 'proj1', name: 'App', description: 'A project', url: '',
            bullets: [{ id: 'pb1', text: 'Built it', enabled: true }], enabled: true,
        },
    ],
    languages: [],
    interests: [],
}

// ─── setResume ────────────────────────────────────────────────────────────────

describe('setResume', () => {
    it('populates regionToSection for all section types', () => {
        const state = reducer(freshState(), setResume(RESUME))
        expect(state.regionToSection['h1']).toBe('header')
        expect(state.regionToSection['s1']).toBe('summary')
        expect(state.regionToSection['exp1']).toBe('experience')
        expect(state.regionToSection['exp2']).toBe('experience')
        expect(state.regionToSection['edu1']).toBe('education')
        expect(state.regionToSection['cert1']).toBe('certifications')
        expect(state.regionToSection['skill1']).toBe('skills')
        expect(state.regionToSection['proj1']).toBe('projects')
    })

    it('maps bullets to their parent entry in subRegionToRegion', () => {
        const state = reducer(freshState(), setResume(RESUME))
        expect(state.subRegionToRegion['b1']).toBe('exp1')
        expect(state.subRegionToRegion['pb1']).toBe('proj1')
    })

    it('sets subToggleVisibility true for all section entries', () => {
        const state = reducer(freshState(), setResume(RESUME))
        expect(state.subToggleVisibility['exp1']).toBe(true)
        expect(state.subToggleVisibility['edu1']).toBe(true)
        expect(state.subToggleVisibility['proj1']).toBe(true)
    })

    it('resets isDirty to false', () => {
        const dirty = { ...freshState(), isDirty: true }
        const state = reducer(dirty, setResume(RESUME))
        expect(state.isDirty).toBe(false)
    })
})

// ─── addExperience ────────────────────────────────────────────────────────────

describe('addExperience', () => {
    it('appends a new entry to experience', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addExperience())
        expect(state.resume.experience).toHaveLength(3)
    })

    it('registers the new entry in regionToSection', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addExperience())
        const newId = state.resume.experience[2].id
        expect(state.regionToSection[newId]).toBe('experience')
    })

    it('registers the new entry in subToggleVisibility as open', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addExperience())
        const newId = state.resume.experience[2].id
        expect(state.subToggleVisibility[newId]).toBe(true)
    })

    it('sets isDirty', () => {
        const state = reducer(freshState(), addExperience())
        expect(state.isDirty).toBe(true)
    })
})

// ─── removeExperience ─────────────────────────────────────────────────────────

describe('removeExperience', () => {
    it('removes the entry from experience', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeExperience('exp1'))
        expect(state.resume.experience.find(e => e.id === 'exp1')).toBeUndefined()
    })

    it('removes the entry from regionToSection', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeExperience('exp1'))
        expect(state.regionToSection['exp1']).toBeUndefined()
    })

    it('removes the entry from subToggleVisibility', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeExperience('exp1'))
        expect(state.subToggleVisibility['exp1']).toBeUndefined()
    })

    it('sets isDirty', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeExperience('exp1'))
        expect(state.isDirty).toBe(true)
    })
})

// ─── reorderExperience ────────────────────────────────────────────────────────

describe('reorderExperience', () => {
    it('swaps two entries when moving index 0 to index 1', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, reorderExperience({ fromIndex: 0, toIndex: 1 }))
        expect(state.resume.experience[0].id).toBe('exp2')
        expect(state.resume.experience[1].id).toBe('exp1')
    })

    it('sets isDirty', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, reorderExperience({ fromIndex: 0, toIndex: 1 }))
        expect(state.isDirty).toBe(true)
    })
})

// ─── addBullet ────────────────────────────────────────────────────────────────

describe('addBullet', () => {
    it('appends a bullet to the target entry', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addBullet({ section: 'experience', entryId: 'exp1' }))
        expect(state.resume.experience.find(e => e.id === 'exp1')!.bullets).toHaveLength(2)
    })

    it('registers the new bullet in subRegionToRegion', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addBullet({ section: 'experience', entryId: 'exp1' }))
        const bullets = state.resume.experience.find(e => e.id === 'exp1')!.bullets
        const newBulletId = bullets[bullets.length - 1].id
        expect(state.subRegionToRegion[newBulletId]).toBe('exp1')
    })

    it('sets isDirty', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, addBullet({ section: 'experience', entryId: 'exp1' }))
        expect(state.isDirty).toBe(true)
    })
})

// ─── removeBullet ─────────────────────────────────────────────────────────────

describe('removeBullet', () => {
    it('removes the bullet from the entry', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeBullet({ section: 'experience', entryId: 'exp1', bulletId: 'b1' }))
        expect(state.resume.experience.find(e => e.id === 'exp1')!.bullets).toHaveLength(0)
    })

    it('removes the bullet from subRegionToRegion', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeBullet({ section: 'experience', entryId: 'exp1', bulletId: 'b1' }))
        expect(state.subRegionToRegion['b1']).toBeUndefined()
    })

    it('sets isDirty', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, removeBullet({ section: 'experience', entryId: 'exp1', bulletId: 'b1' }))
        expect(state.isDirty).toBe(true)
    })
})

// ─── reorderBullets ───────────────────────────────────────────────────────────

describe('reorderBullets', () => {
    it('swaps two bullets when moving index 0 to index 1', () => {
        const resumeWithTwo: Resume = {
            ...RESUME,
            experience: [{
                ...RESUME.experience[0],
                bullets: [
                    { id: 'b1', text: 'First', enabled: true },
                    { id: 'b2', text: 'Second', enabled: true },
                ],
            }, RESUME.experience[1]],
        }
        const before = reducer(freshState(), setResume(resumeWithTwo))
        const state = reducer(before, reorderBullets({ section: 'experience', entryId: 'exp1', fromIndex: 0, toIndex: 1 }))
        const bullets = state.resume.experience.find(e => e.id === 'exp1')!.bullets
        expect(bullets[0].id).toBe('b2')
        expect(bullets[1].id).toBe('b1')
    })
})

// ─── updateOrder ──────────────────────────────────────────────────────────────

describe('updateOrder', () => {
    it('moves a section from index 0 to index 2', () => {
        const state = reducer(freshState(), updateOrder({ fromIndex: 0, toIndex: 2 }))
        // default classic order: education, certifications, experience, projects, skills
        // after moving index 0 (education) to index 2: certifications, experience, education, projects, skills
        expect(state.order[2]).toBe('education')
        expect(state.order[0]).toBe('certifications')
    })

    it('sets isDirty', () => {
        const state = reducer(freshState(), updateOrder({ fromIndex: 0, toIndex: 1 }))
        expect(state.isDirty).toBe(true)
    })
})

// ─── dismissSuggestion / dismissAllSuggestions ───────────────────────────────

describe('dismissSuggestion', () => {
    it('removes only the matching suggested bullet', () => {
        const withSuggestions: ResumeState = {
            ...freshState(),
            suggestions: {
                suggestedBullets: [
                    { id: 'sb1', text: 'old', newText: 'new' },
                    { id: 'sb2', text: 'old2', newText: 'new2' },
                ],
                missingKeywords: [],
                numSuggestions: 2,
            },
        }
        const state = reducer(withSuggestions, dismissSuggestion('sb1'))
        expect(state.suggestions.suggestedBullets).toHaveLength(1)
        expect(state.suggestions.suggestedBullets[0].id).toBe('sb2')
    })
})

describe('dismissAllSuggestions', () => {
    it('clears all suggested bullets', () => {
        const withSuggestions: ResumeState = {
            ...freshState(),
            suggestions: {
                suggestedBullets: [
                    { id: 'sb1', text: 'old', newText: 'new' },
                ],
                missingKeywords: [],
                numSuggestions: 1,
            },
        }
        const state = reducer(withSuggestions, dismissAllSuggestions())
        expect(state.suggestions.suggestedBullets).toHaveLength(0)
    })
})

// ─── toggleExperience ─────────────────────────────────────────────────────────

describe('toggleExperience', () => {
    it('flips enabled from true to false', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, toggleExperience('exp1'))
        expect(state.resume.experience.find(e => e.id === 'exp1')!.enabled).toBe(false)
    })

    it('flips enabled from false to true', () => {
        const resumeDisabled: Resume = {
            ...RESUME,
            experience: [{ ...RESUME.experience[0], enabled: false }, RESUME.experience[1]],
        }
        const before = reducer(freshState(), setResume(resumeDisabled))
        const state = reducer(before, toggleExperience('exp1'))
        expect(state.resume.experience.find(e => e.id === 'exp1')!.enabled).toBe(true)
    })
})

// ─── toggleSectionVisibility ──────────────────────────────────────────────────

describe('toggleSectionVisibility', () => {
    it('flips a section from visible to hidden', () => {
        const state = reducer(freshState(), toggleSectionVisibility('experience'))
        expect(state.visibility.experience).toBe(false)
    })

    it('flips a section from hidden to visible', () => {
        const hidden = { ...freshState(), visibility: { ...freshState().visibility, experience: false } }
        const state = reducer(hidden, toggleSectionVisibility('experience'))
        expect(state.visibility.experience).toBe(true)
    })
})

// ─── updateHeader ─────────────────────────────────────────────────────────────

describe('updateHeader', () => {
    it('patches the specified header fields', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, updateHeader({ name: 'John', email: 'john@example.com' }))
        expect(state.resume.header.name).toBe('John')
        expect(state.resume.header.email).toBe('john@example.com')
        expect(state.resume.header.phone).toBe('555')
    })

    it('sets isDirty', () => {
        const before = reducer(freshState(), setResume(RESUME))
        const state = reducer(before, updateHeader({ name: 'John' }))
        expect(state.isDirty).toBe(true)
    })
})

