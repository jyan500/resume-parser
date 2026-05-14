import { describe, it, expect } from 'vitest'
import { normalizeText } from './functions'

describe('normalizeText', () => {
    it('collapses newlines into spaces', () => {
        expect(normalizeText('hello\nworld')).toBe('hello world')
    })

    it('collapses CRLF into spaces', () => {
        expect(normalizeText('hello\r\nworld')).toBe('hello world')
    })

    it('collapses multiple spaces into one', () => {
        expect(normalizeText('  hello   world  ')).toBe('hello world')
    })

    it('returns empty string for null', () => {
        expect(normalizeText(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
        expect(normalizeText(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
        expect(normalizeText('')).toBe('')
    })
})
