import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { baseQuery } from "./baseQuery"
import { store } from "../store"
import {
    setTurnstileToken,
    clearTurnstileToken,
    setDevBypass,
} from "../slices/turnstileSlice"
import type { BaseQueryApi } from "@reduxjs/toolkit/query"

function makeApi(): BaseQueryApi {
    const controller = new AbortController()
    return {
        signal: controller.signal,
        abort: () => controller.abort(),
        dispatch: store.dispatch,
        getState: store.getState,
        extra: undefined,
        endpoint: "test",
        type: "mutation",
        forced: false,
    } as BaseQueryApi
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    })
}

const originalFetch = globalThis.fetch

beforeEach(() => {
    store.dispatch(clearTurnstileToken())
    store.dispatch(setDevBypass(false))
})

afterEach(() => {
    globalThis.fetch = originalFetch
    vi.useRealTimers()
})

describe("baseQuery — token present", () => {
    it("proceeds without waiting and dispatches clearTurnstileToken after success", async () => {
        store.dispatch(setTurnstileToken("T1"))
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
        globalThis.fetch = fetchMock

        const result = await baseQuery({ url: "/x", method: "POST", body: {} }, makeApi(), {})

        expect(fetchMock).toHaveBeenCalledOnce()
        expect("data" in result).toBe(true)
        expect(store.getState().turnstile.token).toBeNull()
    })

    it("dispatches clearTurnstileToken even when the request errors", async () => {
        store.dispatch(setTurnstileToken("T1"))
        globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse({ errors: ["nope"] }, 500))

        const result = await baseQuery({ url: "/x", method: "POST", body: {} }, makeApi(), {})

        expect("error" in result).toBe(true)
        expect(store.getState().turnstile.token).toBeNull()
    })
})

describe("baseQuery — token absent", () => {
    it("waits for setTurnstileToken before calling fetch", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
        globalThis.fetch = fetchMock

        const promise = baseQuery({ url: "/x", method: "POST", body: {} }, makeApi(), {})

        // give microtasks a chance to settle so the listener is registered
        await Promise.resolve()
        expect(fetchMock).not.toHaveBeenCalled()

        store.dispatch(setTurnstileToken("T-fresh"))
        const result = await promise

        expect(fetchMock).toHaveBeenCalledOnce()
        expect("data" in result).toBe(true)
    })

    it("returns TURNSTILE_TIMEOUT and skips fetch when no token arrives in 15s", async () => {
        vi.useFakeTimers()
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
        globalThis.fetch = fetchMock

        const promise = baseQuery({ url: "/x", method: "POST", body: {} }, makeApi(), {})
        await vi.advanceTimersByTimeAsync(15_001)
        const result = await promise

        expect(fetchMock).not.toHaveBeenCalled()
        expect("error" in result).toBe(true)
        if ("error" in result && result.error) {
            expect(result.error.status).toBe("TURNSTILE_TIMEOUT")
        }
    })
})

describe("baseQuery — dev bypass", () => {
    it("skips the wait and the post-call clear when devBypass is true", async () => {
        store.dispatch(setDevBypass(true))
        store.dispatch(setTurnstileToken("dev-bypass"))
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
        globalThis.fetch = fetchMock

        await baseQuery({ url: "/x", method: "POST", body: {} }, makeApi(), {})

        expect(fetchMock).toHaveBeenCalledOnce()
        // post-call clear is skipped under dev bypass; token survives
        expect(store.getState().turnstile.token).toBe("dev-bypass")
    })
})
