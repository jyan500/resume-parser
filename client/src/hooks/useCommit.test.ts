import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCommit, DEFAULT_COMMIT_DELAY } from './useCommit'

const DELAY = DEFAULT_COMMIT_DELAY

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('useCommit', () => {
    it('initialises local state to the redux value', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        expect(result.current.local).toBe('hello')
    })

    it('updates local state immediately on handleChange', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('world'))
        expect(result.current.local).toBe('world')
    })

    it('does not call onChange before the delay elapses', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('world'))
        act(() => vi.advanceTimersByTime(DELAY - 1))
        expect(onChange).not.toHaveBeenCalled()
    })

    it('calls onChange after the delay elapses', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('world'))
        act(() => vi.advanceTimersByTime(DELAY))
        expect(onChange).toHaveBeenCalledOnce()
        expect(onChange).toHaveBeenCalledWith('world')
    })

    it('does not call onChange when the value equals the redux value', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('hello'))
        act(() => vi.advanceTimersByTime(DELAY))
        expect(onChange).not.toHaveBeenCalled()
    })

    it('debounces rapid keystrokes — only the last value is dispatched', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('', onChange, DELAY))
        act(() => {
            result.current.handleChange('h')
            result.current.handleChange('he')
            result.current.handleChange('hel')
        })
        act(() => vi.advanceTimersByTime(DELAY))
        expect(onChange).toHaveBeenCalledOnce()
        expect(onChange).toHaveBeenCalledWith('hel')
    })

    it('flush() dispatches immediately without waiting for the timer', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('world'))
        act(() => result.current.flush())
        expect(onChange).toHaveBeenCalledOnce()
        expect(onChange).toHaveBeenCalledWith('world')
    })

    it('flush() cancels the pending timer so onChange is not called twice', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.handleChange('world'))
        act(() => result.current.flush())
        act(() => vi.advanceTimersByTime(DELAY))
        expect(onChange).toHaveBeenCalledOnce()
    })

    it('flush() is a no-op when there is no pending value', () => {
        const onChange = vi.fn()
        const { result } = renderHook(() => useCommit('hello', onChange, DELAY))
        act(() => result.current.flush())
        expect(onChange).not.toHaveBeenCalled()
    })

    it('syncs local state when reduxValue changes externally', () => {
        const onChange = vi.fn()
        let reduxValue = 'initial'
        const { result, rerender } = renderHook(() => useCommit(reduxValue, onChange, DELAY))
        reduxValue = 'updated externally'
        rerender()
        expect(result.current.local).toBe('updated externally')
    })
})
